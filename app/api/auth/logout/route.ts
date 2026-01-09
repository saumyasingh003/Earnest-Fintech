import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import {
  getAuthCookies,
  clearAuthCookies,
  jsonResponse,
} from "@/lib/auth-utils";

export async function POST() {
  try {
    const { accessToken } = await getAuthCookies();

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);

      if (payload) {
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshToken: null },
        });
      }
    }

    await clearAuthCookies();

    return jsonResponse({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    await clearAuthCookies();
    return jsonResponse({
      message: "Logout successful",
    });
  }
}
