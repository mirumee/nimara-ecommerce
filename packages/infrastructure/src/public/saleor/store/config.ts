import { type ThumbnailFormatEnum } from "@nimara/codegen/schema";

export const IMAGE_FORMAT = (process.env.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT ||
  "AVIF") as ThumbnailFormatEnum;
export const IMAGE_SIZES = {
  productDetail: 1024,
};
