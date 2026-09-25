Feature("Homepage");

Before(({ homepagePage }) => {
  homepagePage.enterPage();
});

Scenario("Homepage loads with its product carousel", ({ homepagePage }) => {
  homepagePage.seeStorefrontLoaded();
});

Scenario("Explore products opens the product listing", ({ homepagePage }) => {
  homepagePage.openProductListing();
});
