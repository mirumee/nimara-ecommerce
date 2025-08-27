import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || params.slug;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          fontFamily: '"Inter", system-ui, sans-serif',
          fontWeight: "800",
          fontSize: title.length > 50 ? "56px" : "72px",
          color: "white",
          textAlign: "center",
          padding: "60px",
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: await fetch(
            new URL(
              "https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap",
            ),
          ).then((res) => res.arrayBuffer()),
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
