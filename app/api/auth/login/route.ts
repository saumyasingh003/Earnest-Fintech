import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/password";
import { generateTokens } from "@/lib/jwt";
import { setAuthCookies, jsonResponse, errorResponse } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    const hashedRefreshToken = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    await setAuthCookies(accessToken, refreshToken);

    return jsonResponse({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
