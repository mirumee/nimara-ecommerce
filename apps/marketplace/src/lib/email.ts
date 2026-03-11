import { render } from "@react-email/render";
import nodemailer from "nodemailer";

import { config } from "@/lib/config";
import { NewVendorRegistrationEmail } from "@/lib/email-templates/new-vendor-registration";
import { VendorAcceptedEmail } from "@/lib/email-templates/vendor-accepted";
import { VendorRejectedEmail } from "@/lib/email-templates/vendor-rejected";

type NewVendorEmailPayload = {
  companyName: string;
  contactEmail: string;
  vatId: string;
  vendorId?: string;
  vendorName: string;
  vendorSlug?: string;
};

type VendorStatusEmailPayload = {
  companyName: string;
  contactEmail: string;
  signInUrl?: string;
  superadminEmail?: string;
  vendorName: string;
};

function isEmailConfigured(): boolean {
  const { smtp, from } = config.email;

  return Boolean(smtp.host && from);
}

function createTransport() {
  const { smtp } = config.email;

  if (!smtp.host) {
    throw new Error("MARKETPLACE_SMTP_HOST is not configured");
  }

  const isPort587 = smtp.port === 587;
  const useSecure = isPort587 ? false : smtp.secure;

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: useSecure,
    // Port 587 uses STARTTLS: connect in plaintext, then upgrade. Explicit
    // requireTLS avoids "wrong version number" from premature TLS handshake.
    ...(isPort587 ? { requireTLS: true } : {}),
    auth:
      smtp.user && smtp.password
        ? {
            user: smtp.user,
            pass: smtp.password,
          }
        : undefined,
  });
}

function getSafeEmailConfigForLogs() {
  const { smtp, from, superadminEmail } = config.email;

  return {
    from,
    superadminEmail,
    smtp: {
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      user: smtp.user,
      password: smtp.password ? "***" : undefined,
    },
  };
}

async function sendMail(opts: {
  html?: string;
  subject: string;
  text: string;
  to: string;
}) {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] Email is not fully configured, skipping send.",
      getSafeEmailConfigForLogs(),
    );

    return;
  }

  const transport = createTransport();

  await transport.sendMail({
    from: config.email.from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    ...(opts.html ? { html: opts.html } : {}),
  });
}

export async function sendNewVendorRegisteredEmailToSuperadmin(
  payload: NewVendorEmailPayload,
) {
  const { superadminEmail } = config.email;

  if (!superadminEmail) {
    console.warn(
      "[email] MARKETPLACE_SUPERADMIN_EMAIL is not configured, skipping new vendor notification.",
    );

    return;
  }

  const { vendorName, companyName, vatId, contactEmail, vendorId, vendorSlug } =
    payload;

  const text = [
    "A new vendor has registered in the marketplace.",
    "",
    `Vendor name: ${vendorName}`,
    `Company name: ${companyName}`,
    `VAT ID: ${vatId}`,
    `Contact email: ${contactEmail}`,
    ...(vendorId ? [`Vendor model ID: ${vendorId}`] : []),
    ...(vendorSlug ? [`Vendor slug: ${vendorSlug}`] : []),
    "",
    "You can review this vendor in the Saleor dashboard.",
  ].join("\n");

  const html = await render(
    NewVendorRegistrationEmail({
      companyName,
      contactEmail,
      vendorId,
      vendorName,
      vendorSlug,
      vatId,
    }),
  );

  await sendMail({
    to: superadminEmail,
    subject: "New vendor registration",
    text,
    html,
  });
}

export async function sendVendorAcceptedEmail(
  payload: VendorStatusEmailPayload,
) {
  const { vendorName, companyName, contactEmail, signInUrl } = payload;

  const text = [
    `Hello ${vendorName || companyName},`,
    "",
    "Your Nimara marketplace vendor account has been approved.",
    "",
    "You can now sign in and start using the marketplace.",
    ...(signInUrl ? ["", `Sign in here: ${signInUrl}`] : []),
    "",
    "Best regards,",
    "Nimara Marketplace Team",
  ].join("\n");

  const html = await render(
    VendorAcceptedEmail({
      companyName,
      signInUrl,
      vendorName,
    }),
  );

  await sendMail({
    to: contactEmail,
    subject: "Your Nimara marketplace vendor account has been approved",
    text,
    html,
  });
}

export async function sendVendorRejectedEmail(
  payload: VendorStatusEmailPayload,
) {
  const { vendorName, companyName, contactEmail, superadminEmail } = payload;

  const adminEmail =
    superadminEmail ?? config.email.superadminEmail ?? undefined;

  const text = [
    `Hello ${vendorName || companyName},`,
    "",
    "Thank you for your interest in the Nimara marketplace.",
    "After reviewing your application, we are unable to approve your vendor account at this time.",
    ...(adminEmail
      ? [
          "",
          `If you need more details, please contact the marketplace administrator at: ${adminEmail}`,
        ]
      : []),
    "",
    "Best regards,",
    "Nimara Marketplace Team",
  ].join("\n");

  const html = await render(
    VendorRejectedEmail({
      companyName,
      superadminEmail: adminEmail,
      vendorName,
    }),
  );

  await sendMail({
    to: contactEmail,
    subject: "Your Nimara marketplace vendor account has been rejected",
    text,
    html,
  });
}
