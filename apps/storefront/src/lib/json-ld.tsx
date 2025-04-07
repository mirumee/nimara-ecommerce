import type {
  ItemList,
  Product,
  Thing,
  WebSite,
  WithContext,
} from "schema-dts";

import type {
  Product as ProductVariant,
  ProductAvailability,
} from "@nimara/domain/objects/Product";
import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

export const JsonLd = <T extends Thing>({
  jsonLd,
}: {
  jsonLd: WithContext<T>;
}) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export const productToJsonLd = (
  product: ProductVariant,
  availability: ProductAvailability,
): WithContext<Product> => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: {
      "@type": "ImageObject",
      url: product.images[0]?.url ?? undefined,
      description: product.images[0]?.alt ?? undefined,
    },
    description: product.description ?? undefined,
    offers: {
      "@type": "Offer",
      price: availability.startPrice.amount,
      priceCurrency: availability.startPrice.currency,
      availability: availability.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
};

export const searchProductToJsonLd = (
  product: SearchProduct,
): WithContext<Product> => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.thumbnail
      ? {
          "@type": "ImageObject",
          url: product.thumbnail.url,
          description: product.thumbnail.alt ?? undefined,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
    },
  };
};

export const mappedSearchProductsToJsonLd = (
  products: SearchProduct[],
): WithContext<ItemList> => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: searchProductToJsonLd(product),
    })),
  };
};

export const websiteToJsonLd = (): WithContext<WebSite> => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nimara Storefront",
    url: "https://www.nimara.store.com",
    mainEntityOfPage: {
      "@type": "WebPage",
      url: "https://www.nimara.store.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Nimara Storefront",
      url: "https://www.nimara.store.com",
      image: {
        "@type": "ImageObject",
        url: "/brand-logo.svg",
      },
    },
  };
};
