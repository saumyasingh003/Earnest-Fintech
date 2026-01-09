import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateTokens } from "@/lib/jwt";
import { setAuthCookies, jsonResponse, errorResponse } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse("User with this email already exists", 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    const hashedRefreshToken = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    await setAuthCookies(accessToken, refreshToken);

    return jsonResponse(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Internal server error", 500);
  }
}
