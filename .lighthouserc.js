// A list of paths to check
// To add a new path to test just add it to this list
const pathsToTest = ["/gb", "/gb/search", "/us", "/us/search"];

// A list of full URLs used to test against
const urls = pathsToTest.map((path) =>
  new URL(path, process.env.NEXT_PUBLIC_STOREFRONT_URL).toString(),
);

module.exports = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: 2,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      preset: "lighthouse:recommended",
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
