import { type MetadataItem } from "@nimara/codegen/schema";
import { type Metadata } from "@nimara/domain/objects/Metadata";

export const serializeMetadata = (metadata: MetadataItem[]) =>
  metadata.reduce<Metadata>((acc, { key, value }) => {
    acc[key] = value;

    return acc;
  }, {});
