# Comments

- If a fragment needs an explanation, rename the symbol or extract a function.
- Keep comments that already exist in the file. Do not delete them and do not extend them.
- Exceptions to the no-comment rule: a license header, a pragma that the toolchain reads
  (`@ts-expect-error`, `eslint-disable`, `biome-ignore`), and a JSDoc block that the
  public API of a package must publish.
