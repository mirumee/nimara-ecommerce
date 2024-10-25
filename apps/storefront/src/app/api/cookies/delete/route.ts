import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json()) as { cookieKey: string };
  const cookieStore = await cookies();

  if (cookieStore.has(body.cookieKey)) {
    cookieStore.delete(body.cookieKey);
  }

  return Response.json({ message: "ok" });
}
