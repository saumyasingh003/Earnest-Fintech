import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/password";
import { verifyRefreshToken, generateTokens } from "@/lib/jwt";
import {
  getAuthCookies,
  setAuthCookies,
  clearAuthCookies,
  jsonResponse,
  errorResponse,
} from "@/lib/auth-utils";

export async function POST() {
  try {
    const { refreshToken } = await getAuthCookies();

    if (!refreshToken) {
      return errorResponse("Refresh token not found", 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      await clearAuthCookies();
      return errorResponse("Invalid or expired refresh token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.refreshToken) {
      await clearAuthCookies();
      return errorResponse("User not found or session expired", 401);
    }

    const isRefreshTokenValid = await comparePassword(
      refreshToken,
      user.refreshToken
    );

    if (!isRefreshTokenValid) {
      await clearAuthCookies();
      return errorResponse("Invalid refresh token", 401);
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const tokens = generateTokens(tokenPayload);

    const hashedRefreshToken = await hashPassword(tokens.refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return jsonResponse({
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return errorResponse("Internal server error", 500);
  }
}
