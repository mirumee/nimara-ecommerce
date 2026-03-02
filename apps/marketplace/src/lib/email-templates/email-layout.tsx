import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const BRAND = "Nimara Marketplace";

type EmailLayoutProps = {
  children: ReactNode;
  preview?: string;
};

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-slate-100 font-sans">
          <Container className="mx-auto mb-16 max-w-[560px] rounded-lg bg-white px-0 pb-12 pt-5 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <Section className="px-10 pb-6">
              <Text className="m-0 text-xl font-semibold text-slate-900">
                {BRAND}
              </Text>
            </Section>
            <Section className="px-10">{children}</Section>
            <Hr className="mx-10 my-6 border-slate-200" />
            <Section className="px-10">
              <Text className="m-0 text-sm leading-6 text-slate-500">
                Best regards,
              </Text>
              <Text className="m-0 text-sm leading-6 text-slate-500">
                {BRAND} Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
