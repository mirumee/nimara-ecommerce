# Dependency management

Never add, remove, upgrade, or relocate a dependency without explicit user approval. This
includes direct `package.json` edits and generator commands that change dependencies.

## Before requesting approval

1. Confirm the target workspace and whether the dependency is needed at runtime, during
   development, or only by a peer consumer.
2. Search the target workspace and lockfile for an existing suitable dependency or native
   repository pattern.
3. Consider implementing the small behavior locally when that is simpler and maintainable.
4. Check architectural fit, bundle impact, maintenance cost, and overlap with current tools.

## Request approval

Provide:

- dependency name and target workspace;
- concrete purpose and why current code cannot satisfy it cleanly;
- runtime, development, or peer classification;
- viable alternatives with their trade-offs;
- expected files and lockfile impact.

Ask a direct yes-or-no question and wait. Do not run a package-manager command or edit a
manifest while approval is pending.

## After approval

Use a workspace-scoped pnpm command so ownership is explicit. Add root dependencies only for
repository-wide tooling.

Then verify:

1. only the intended manifest changed;
2. the dependency is in the correct section;
3. the lockfile contains the expected change without unrelated churn;
4. the target workspace can lint, type-check, test, or build as appropriate;
5. the diff does not include generated or formatting noise unrelated to the dependency.

Report the exact manifest, classification, command, and validation results.

## Existing dependencies

Using a dependency already declared by the target workspace requires no installation.
However, a dependency declared only in another workspace is not automatically available:
adding it to the new consumer's manifest is still a dependency change and requires approval.

Do not rely on accidental pnpm hoisting or manually edit `package.json` to bypass the
approval workflow.
