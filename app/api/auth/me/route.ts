import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { getAuthCookies, jsonResponse, errorResponse } from "@/lib/auth-utils";

export async function GET() {
  try {
    const { accessToken } = await getAuthCookies();

    if (!accessToken) {
      return jsonResponse({ authenticated: false, user: null });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return jsonResponse({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return jsonResponse({ authenticated: false, user: null });
    }

    return jsonResponse({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return errorResponse("Internal server error", 500);
  }
}
