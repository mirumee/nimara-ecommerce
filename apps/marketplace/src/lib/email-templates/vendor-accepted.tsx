import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

type VendorAcceptedProps = {
  companyName: string;
  signInUrl?: string;
  vendorName: string;
};

export function VendorAcceptedEmail({
  companyName,
  signInUrl,
  vendorName,
}: VendorAcceptedProps) {
  const greeting = vendorName || companyName || "Vendor";

  return (
    <EmailLayout preview="Your vendor account has been approved">
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        Hello {greeting},
      </Text>
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        Your Nimara marketplace vendor account has been approved.
      </Text>
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        You can now sign in and start using the marketplace.
      </Text>
      {signInUrl ? (
        <Section className="my-6">
          <Button
            className="block rounded bg-[#5469d4] px-5 py-3 text-center text-base font-semibold text-white no-underline"
            href={signInUrl}
          >
            Sign in
          </Button>
        </Section>
      ) : null}
    </EmailLayout>
  );
}
