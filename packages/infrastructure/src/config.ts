import { type ThumbnailFormatEnum } from "@nimara/codegen/schema";

export const THUMBNAIL_FORMAT = (process.env.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT ||
  "AVIF") as ThumbnailFormatEnum;

export const THUMBNAIL_SIZE_SMALL = 256;
export const THUMBNAIL_SIZE_MEDIUM = 512;
export const THUMBNAIL_SIZE_LARGE = 1024;

export const isSsr = typeof window === "undefined";
