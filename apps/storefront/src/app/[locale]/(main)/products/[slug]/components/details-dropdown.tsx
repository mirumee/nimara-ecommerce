import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nimara/ui/components/accordion";
import { RichText } from "@nimara/ui/components/rich-text";

export const DetailsDropdown = ({ description }: { description: string }) => {
  const t = useTranslations();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="description">
        <AccordionTrigger>{t("products.description")}</AccordionTrigger>
        <AccordionContent>
          <RichText className="py-8" jsonStringData={description} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
