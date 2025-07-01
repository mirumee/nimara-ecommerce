import "nextra-theme-docs/style.css";

import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";

import Logo from "../images/logo.svg";

export const metadata = {
  title: {
    default: "Nimara Storefront",
    template: "%s | Nimara Storefront",
  },
  viewport: "width=device-width, initial-scale=1.0",
};

const navbar = (
  <Navbar
    logo={<Logo />}
    logoLink="https://www.demo.nimara.store/"
    projectLink="https://github.com/mirumee/nimara-ecommerce/tree/main/apps/storefront"
    chatLink="https://discord.com/channels/1271065464407068702"
  />
);

const footer = <Footer>© Nimara {new Date().getFullYear()}</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/mirumee/nimara-ecommerce/tree/main/apps/docs"
          editLink="Edit this page on GitHub"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
