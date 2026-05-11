const NextjsIcon = () => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 72 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M36 0C16.1438 0 0 16.1438 0 36C0 55.8562 16.1438 72 36 72C42.3 72 48.2063 70.3687 53.325 67.5562L27.225 31.1062V51.6938H23.4V23.5125H27.225L55.6313 66.15C65.475 59.7375 72 48.6562 72 36C72 16.1438 55.8562 0 36 0ZM48.4312 47.5875L44.2125 41.2313V23.5125H48.4312V47.5875Z"
      fill="hsl(var(--muted-foreground))"
    />
  </svg>
);

const SaleorIcon = () => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 72 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M36 0C55.8823 0 72 16.1177 72 36C72 55.8823 55.8823 72 36 72C16.1177 72 0 55.8823 0 36C0 16.1177 16.1177 0 36 0ZM10.8457 43.7734H47.958L61.1602 28.2568H24.0469L10.8457 43.7734Z"
      fill="hsl(var(--muted-foreground))"
    />
  </svg>
);

export const FoundationBanner = () => (
  <div className="my-12">
    <div className="border-border bg-background flex flex-col gap-8 border p-8 sm:flex-row sm:items-center">
      <p className="text-muted-foreground min-w-0 flex-1 text-3xl leading-none font-normal">
        <span className="text-foreground">
          The open-source storefront built on Next.js and Saleor
        </span>
        {
          ", architected to scale from a single brand to a multi-vendor platform."
        }
      </p>
      <div className="flex shrink-0 gap-4">
        <NextjsIcon />
        <SaleorIcon />
      </div>
    </div>
  </div>
);
