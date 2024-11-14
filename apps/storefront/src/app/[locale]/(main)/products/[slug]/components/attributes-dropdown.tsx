import type { Attribute } from "@nimara/domain/objects/Attribute";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nimara/ui/components/accordion";
import { RichText } from "@nimara/ui/components/rich-text";

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
      {attributes.map((attribute) => (
        <AccordionItem key={attribute.slug} value={attribute.name}>
          <AccordionTrigger className="capitalize">
            {attribute.name}
          </AccordionTrigger>
          <AccordionContent>
            {attribute.values.map((val) => {
              if (val.richText) {
                return (
                  <RichText key={val.name} jsonStringData={val.richText} />
                );
              }

              return <p key={val.name}>{val.name}</p>;
            })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
