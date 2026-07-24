import { RichText } from "@nimara/ui/components/rich-text/rich-text";

type Props = {
  description?: unknown;
};

export const ListingDescription = ({ description }: Props) => {
  if (!description) {
    return null;
  }

  return (
    <div className="w-full">
      <RichText
        className="max-w-none"
        contentData={
          description as Parameters<typeof RichText>[0]["contentData"]
        }
      />
    </div>
  );
};
