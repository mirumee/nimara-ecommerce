/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["./packages/config/src/eslint/base.cjs"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
