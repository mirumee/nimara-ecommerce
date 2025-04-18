import type { Attribute } from "@nimara/domain/objects/Attribute";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nimara/ui/components/accordion";
import { RichText } from "@nimara/ui/components/rich-text/rich-text";
import { parseEditorJSData } from "@nimara/ui/lib/richText";

export const AttributesDropdown = ({
  attributes,
}: {
  attributes: Attribute[];
}) => {
  if (!attributes.length) {
    return null;
  }

  return (
    <Accordion className="mt-4" type="single" collapsible>
      {attributes.map((attribute) => {
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
                  <RichText key={val.name} contentData={val.richText} />
                ) : (
                  <p key={val.name}>{val.name}</p>
                ),
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
