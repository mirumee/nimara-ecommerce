import { type Menu } from "@nimara/domain/objects/Menu";

export const SAMPLE_MENUS: Record<"navbar" | "footer", Menu> = {
  navbar: {
    items: [
      { id: "dummy-nav-all", label: "All products", url: "/search" },
      {
        id: "dummy-nav-apparel",
        label: "Apparel",
        url: "/search?category=apparel",
        children: [
          {
            id: "dummy-nav-tees",
            label: "Tees",
            url: "/search?category=apparel",
          },
          {
            id: "dummy-nav-hoodies",
            label: "Hoodies",
            url: "/search?category=apparel",
          },
        ],
      },
      {
        id: "dummy-nav-accessories",
        label: "Accessories",
        url: "/search?category=accessories",
      },
    ],
  },
  footer: {
    items: [
      { id: "dummy-foot-about", label: "About", url: "/page/about" },
      { id: "dummy-foot-terms", label: "Terms", url: "/page/terms" },
    ],
  },
};
