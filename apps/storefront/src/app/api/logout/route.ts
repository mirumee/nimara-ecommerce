import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/sign-in", request.url));

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}
