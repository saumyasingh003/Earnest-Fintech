import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60,
  });

  cookieStore.set("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("accessToken")?.value,
    refreshToken: cookieStore.get("refreshToken")?.value,
  };
}

export function jsonResponse(data: object, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}
