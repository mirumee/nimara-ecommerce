import { Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

type VendorRejectedProps = {
  companyName: string;
  superadminEmail?: string;
  vendorName: string;
};

export function VendorRejectedEmail({
  companyName,
  superadminEmail,
  vendorName,
}: VendorRejectedProps) {
  const greeting = vendorName || companyName || "Vendor";

  return (
    <EmailLayout preview="Your vendor account application">
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        Hello {greeting},
      </Text>
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        Thank you for your interest in the Nimara marketplace.
      </Text>
      <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
        After reviewing your application, we are unable to approve your vendor
        account at this time.
      </Text>
      {superadminEmail ? (
        <Text className="m-0 mb-4 text-base leading-6 text-slate-600">
          If you need more details, please contact the marketplace administrator
          at:{" "}
          <a
            className="text-[#5469d4] underline"
            href={`mailto:${superadminEmail}`}
          >
            {superadminEmail}
          </a>
        </Text>
      ) : null}
    </EmailLayout>
  );
}
