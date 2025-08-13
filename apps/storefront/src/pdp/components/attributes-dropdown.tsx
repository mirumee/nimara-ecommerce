import dynamic from "next/dynamic";

import { type Product } from "@nimara/domain/objects/Product";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nimara/ui/components/accordion";
import { parseEditorJSData } from "@nimara/ui/lib/richText";

const RichText = dynamic(
  () =>
    import("@nimara/ui/components/rich-text/rich-text").then(
      (mod) => mod.RichText,
    ),
  { ssr: true },
);

export const AttributesDropdown = ({ product }: { product: Product }) => {
  if (!product.attributes.length) {
    return null;
  }

  const attributesToDisplay = product.attributes.filter(
    ({ slug }) => slug !== "free-shipping" && slug !== "free-return",
  );

  if (product.description && product.description?.length > 0) {
    attributesToDisplay.unshift({
      name: "description",
      slug: "description",
      type: "RICH_TEXT",
      values: [
        {
          name: "description",
          slug: "description",
          richText: product.description ?? "",
          boolean: false,
          value: "",
          date: undefined,
          dateTime: undefined,
          reference: undefined,
          plainText: "",
        },
      ],
    });
  }

  return (
    <Accordion className="mt-4" type="single" collapsible>
      {attributesToDisplay.map((attribute) => {
        if (
          !attribute.values.some(
            (val) => val.richText && parseEditorJSData(val.richText),
          )
        ) {
          return;
        }

        return (
          <AccordionItem key={attribute.slug} value={attribute.name}>
            <AccordionTrigger className="capitalize">
              {attribute.name}
            </AccordionTrigger>
            <AccordionContent>
              {attribute.values.map((val) =>
                val.richText ? (
                  <RichText
                    className="text-foreground"
                    key={val.name}
                    contentData={val.richText}
                  />
                ) : (
                  <p className="text-foreground" key={val.name}>
                    {val.name}
                  </p>
                ),
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
