import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json()) as { cookieKey: string };

  if (cookies().has(body.cookieKey)) {
    cookies().delete(body.cookieKey);
  }

  return Response.json({ message: "ok" });
}
