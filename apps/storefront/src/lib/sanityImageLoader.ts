export default function sanityLoader({
  src,
  width,
  quality,
}: {
  quality?: number;
  src: string;
  width: number;
}) {
  try {
    const url = new URL(src);

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    url.searchParams.set("w", width.toString());

    if (quality) {
      url.searchParams.set("q", quality.toString());
    }

    return url.href;
  } catch (_) {
    return src;
  }
}
