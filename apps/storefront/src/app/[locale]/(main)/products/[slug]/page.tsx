import dynamic from "next/dynamic";
import { cookies } from "next/headers";

import { generateStandardPDPMetadata } from "@/pdp/views/standard";

const StandardPDPView = dynamic(() =>
  import("@/pdp/views/standard").then((mod) => mod.StandardPDPView),
);

const CustomPDPView = dynamic(() =>
  import("@/pdp/views/custom").then((mod) => mod.CustomPDPView),
);

export const generateMetadata = generateStandardPDPMetadata;

export default async function ProductPage(props: any) {
  // This is just a temporary solution to determine the layout.
  const pdpLayout = (await cookies()).get("PDP_LAYOUT")?.value;

  if (pdpLayout === "CUSTOM") {
    return <CustomPDPView {...props} />;
  }

  // Fallback to standard layout
  return <StandardPDPView {...props} />;
}
