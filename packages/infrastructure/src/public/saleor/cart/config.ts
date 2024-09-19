import { type ThumbnailFormatEnum } from "@nimara/codegen/schema";

export const THUMBNAIL_FORMAT = (process.env.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT ||
  "AVIF") as ThumbnailFormatEnum;

export const THUMBNAIL_SIZE = 256;
