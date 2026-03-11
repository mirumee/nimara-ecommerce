const nextConfig = require("@nimara/config/eslint/next");

module.exports = {
  ...nextConfig,
  extends: [
    ...(nextConfig.extends || []).filter((entry) => entry !== "./base.cjs"),
    require.resolve("./base.js"),
  ],
};
