import dynamic from "next/dynamic";
import { cookies } from "next/headers";

const CustomPDPViewSkeleton = dynamic(
  () => import("@/pdp/views/custom").then((mod) => mod.CustomPDPViewSkeleton),
  { ssr: true },
);
const StandardPDPViewSkeleton = dynamic(
  () =>
    import("@/pdp/views/standard").then((mod) => mod.StandardPDPViewSkeleton),
  { ssr: true },
);

export default async function Loading() {
  // This is just a temporary solution to determine the layout.
  const pdpLayout = (await cookies()).get("PDP_LAYOUT")?.value;

  if (pdpLayout === "CUSTOM") {
    return <CustomPDPViewSkeleton />;
  }

  // Fallback to standard layout
  return <StandardPDPViewSkeleton />;
}
