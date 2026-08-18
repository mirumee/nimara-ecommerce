export const enabledHomepageElements = {
  heroBannerImage: false,
  productsCarouselList: false,
  /**
   * Whether the tested deployment configures NEWSLETTER_SERVICE. The capability
   * has no default provider, so `false` is a real expectation — the form must be
   * absent, not merely unasserted.
   */
  newsletter: false,
};
