import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { getAuthCookies, jsonResponse, errorResponse } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = await getAuthCookies();
    if (!accessToken) {
      return errorResponse("Unauthorized", 401);
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return errorResponse("Invalid or expired token", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: {
      userId: string;
      status?: "TODO" | "IN_PROGRESS" | "COMPLETED";
      priority?: "low" | "medium" | "high";
      title?: { contains: string; mode: "insensitive" };
    } = {
      userId: payload.userId,
    };

    if (status && ["TODO", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      where.status = status as "TODO" | "IN_PROGRESS" | "COMPLETED";
    }

    if (priority && ["low", "medium", "high"].includes(priority)) {
      where.priority = priority as "low" | "medium" | "high";
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const skip = (page - 1) * limit;
    const total = await prisma.task.count({ where });

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonResponse({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + tasks.length < total,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await getAuthCookies();
    if (!accessToken) {
      return errorResponse("Unauthorized", 401);
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return errorResponse("Invalid or expired token", 401);
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate } = body;

    if (!title || title.trim().length === 0) {
      return errorResponse("Title is required", 400);
    }

    if (title.length > 200) {
      return errorResponse("Title must be less than 200 characters", 400);
    }

    if (status && !["TODO", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return errorResponse(
        "Invalid status. Must be TODO, IN_PROGRESS, or COMPLETED",
        400
      );
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return errorResponse(
        "Invalid priority. Must be low, medium, or high",
        400
      );
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || "TODO",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: payload.userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonResponse({ task }, 201);
  } catch (error) {
    console.error("Create task error:", error);
    return errorResponse("Internal server error", 500);
  }
}
