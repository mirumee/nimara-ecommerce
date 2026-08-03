Feature("Homepage");

Before(({ homepage }) => {
  homepage.open();
});

Scenario("Homepage loads with its product carousel", ({ homepage }) => {
  homepage.seeStorefrontLoaded();
});

Scenario("Explore products opens the product listing", ({ homepage }) => {
  homepage.openProductListing();
});
