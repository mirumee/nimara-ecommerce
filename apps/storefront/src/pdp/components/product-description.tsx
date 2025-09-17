import { RichText } from "@nimara/ui/components/rich-text/rich-text";

export const ProductDescription = ({
  description,
}: {
  description: string;
}) => {
  return (
    <div>
      <h2 className="text-primary mb-4 text-xl">Description</h2>
      <RichText className="text-foreground" contentData={description} />
    </div>
  );
};
