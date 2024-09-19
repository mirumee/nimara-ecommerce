module.exports = {
  root: true,
  extends: ["./packages/eslint-config-custom/base"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
