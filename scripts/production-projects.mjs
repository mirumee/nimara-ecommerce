/**
 * The Vercel projects a release promotes together, and the team they live under.
 *
 * The release pre-flight and the promotion workflow both read this list. If they
 * ever disagreed, a release would pass its checks against one set of projects
 * and then promote a different one.
 *
 * nimara-docs is deliberately absent: documentation publishes from `main` to
 * GitHub Pages and is not gated on a tag.
 */
export const PRODUCTION_PROJECTS = [
  "nimara-ecommerce",
  "nimara-ecommerce-stripe",
  "nimara-marketplace",
];

export const VERCEL_SCOPE = "mirumee";
