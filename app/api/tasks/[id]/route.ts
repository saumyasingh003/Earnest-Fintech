import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { getAuthCookies, jsonResponse, errorResponse } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { accessToken } = await getAuthCookies();
    if (!accessToken) {
      return errorResponse("Unauthorized", 401);
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return errorResponse("Invalid or expired token", 401);
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
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

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    return jsonResponse({ task });
  } catch (error) {
    console.error("Get task error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { accessToken } = await getAuthCookies();
    if (!accessToken) {
      return errorResponse("Unauthorized", 401);
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return errorResponse("Invalid or expired token", 401);
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!existingTask) {
      return errorResponse("Task not found", 404);
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate } = body;

    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return errorResponse("Title cannot be empty", 400);
      }
      if (title.length > 200) {
        return errorResponse("Title must be less than 200 characters", 400);
      }
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

    const updateData: {
      title?: string;
      description?: string | null;
      status?: "TODO" | "IN_PROGRESS" | "COMPLETED";
      priority?: string;
      dueDate?: Date | null;
    } = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
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

    return jsonResponse({ task });
  } catch (error) {
    console.error("Update task error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { accessToken } = await getAuthCookies();
    if (!accessToken) {
      return errorResponse("Unauthorized", 401);
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return errorResponse("Invalid or expired token", 401);
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!existingTask) {
      return errorResponse("Task not found", 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    return jsonResponse({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return errorResponse("Internal server error", 500);
  }
}
