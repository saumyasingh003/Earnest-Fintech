import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { getAuthCookies, jsonResponse, errorResponse } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const statusTransition: Record<
      string,
      "TODO" | "IN_PROGRESS" | "COMPLETED"
    > = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "TODO",
    };

    const newStatus = statusTransition[existingTask.status];

    const task = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
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
    console.error("Toggle task error:", error);
    return errorResponse("Internal server error", 500);
  }
}
