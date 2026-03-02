import { Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

type NewVendorRegistrationProps = {
  companyName: string;
  contactEmail: string;
  vatId: string;
  vendorId?: string;
  vendorName: string;
  vendorSlug?: string;
};

export function NewVendorRegistrationEmail({
  companyName,
  contactEmail,
  vatId,
  vendorId,
  vendorName,
  vendorSlug,
}: NewVendorRegistrationProps) {
  return (
    <EmailLayout preview="New vendor registration">
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        A new vendor has registered in the marketplace.
      </Text>
      <Section className="my-4">
        <Text className="m-0 mb-1 text-xs font-semibold uppercase text-slate-500">
          Vendor name
        </Text>
        <Text className="m-0 mb-3 text-[15px] text-slate-600">
          {vendorName}
        </Text>
        <Text className="m-0 mb-1 text-xs font-semibold uppercase text-slate-500">
          Company name
        </Text>
        <Text className="m-0 mb-3 text-[15px] text-slate-600">
          {companyName}
        </Text>
        <Text className="m-0 mb-1 text-xs font-semibold uppercase text-slate-500">
          VAT ID
        </Text>
        <Text className="m-0 mb-3 text-[15px] text-slate-600">{vatId}</Text>
        <Text className="m-0 mb-1 text-xs font-semibold uppercase text-slate-500">
          Contact email
        </Text>
        <Text className="m-0 mb-3 text-[15px] text-slate-600">
          {contactEmail}
        </Text>
        {vendorId ? (
          <>
            <Text className="m-0 mb-1 text-xs font-semibold uppercase text-slate-500">
              Vendor model ID
            </Text>
            <Text className="m-0 mb-3 text-[15px] text-slate-600">
              {vendorId}
            </Text>
          </>
        ) : null}
        {vendorSlug ? (
          <>
            <Text className="m-0 mb-1 text-xs font-semibold uppercase text-slate-500">
              Vendor slug
            </Text>
            <Text className="m-0 mb-3 text-[15px] text-slate-600">
              {vendorSlug}
            </Text>
          </>
        ) : null}
      </Section>
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        You can review this vendor in the Saleor dashboard.
      </Text>
    </EmailLayout>
  );
}
