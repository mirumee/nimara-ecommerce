# Contributing to nimara-ecommerce!

Thank you for considering contributing to nimara-ecommerce!

We welcome all contributions, whether they be code, documentation, bug reports, or any other help you can provide.

## Getting Started

1. **Fork the Repository**:
   - Click the "Fork" button at the top of this repository and clone your fork locally:

     ```bash
     git clone https://github.com/{YOUR_USERNAME}/nimara-ecommerce.git
     ```

   - Navigate to your local repository:

     ```bash
     cd nimara-ecommerce
     ```

2. **Set Upstream**:
   - Add the original repository as a remote to keep your fork in sync:

     ```bash
     git remote add upstream git@github.com:mirumee/nimara-ecommerce.git
     git fetch upstream
     ```

3. **Create a Branch**:
   - Start from the latest upstream `main` and create a short-lived branch for one small change:

     ```bash
     git fetch upstream
     git switch -c contrib/your-feature-name upstream/main
     ```

   - Aim to merge within two working days. Split larger work into independently releasable
     changes, using a short-lived feature flag or branch-by-abstraction seam when incomplete
     behavior must reach `main`.

## Claude Code

The repository enables the official `typescript-lsp` plugin for TypeScript code
intelligence. Claude Code users must install `typescript-language-server` on their machine
using the team's approved tooling and ensure the binary is available on `PATH`. It is a
machine prerequisite, not a repository dependency.

## Making Changes

1. **Code Standards**:
   - Ensure your code adheres to the project's coding standards.
   - Write clear, concise commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) standard. Example:

     ```git
     docs: improve documentation about XXX
     ```

2. **Testing**:
   - Before submitting your code, ensure all tests pass:

     ```bash
     pnpm run test
     ```

   - If you add new features, please write tests for them.

3. **Documentation**:
   - Update or add documentation in the relevant areas.
   - Ensure that the `README.md` file is up-to-date if the new feature impacts its content.

## Submitting Changes

1. **Push to Your Fork**:
   - Push your branch to your forked repository:

     ```bash
     git push origin contrib/your-feature-name
     ```

2. **Create a Pull Request (PR)**:
   - Go to the [Pull Requests](https://github.com/mirumee/nimara-ecommerce/pulls) section of the original repository.
   - Click "New Pull Request".
   - Target `main`, use a Conventional Commit title, and provide a clear summary and testing
     evidence.
   - Wait for the required checks and affected Vercel preview deployments to pass. Bring the
     branch up to date with `main` when GitHub requests it.

3. **Review Process**:
   - A project maintainer will review your PR and may ask for changes.
   - Once approved, the PR is squash-merged into `main` and its branch is deleted.
   - `main` is always expected to be releasable. If a production regression occurs, restore the
     previous Vercel deployment and submit a revert or fix-forward PR; do not rewrite `main` or
     published tags.

## Reporting Issues

- If you encounter a bug or have a feature request, please [open an issue](https://github.com/mirumee/nimara-ecommerce/issues).
- Provide as much information as possible, including steps to reproduce the issue, environment details, and any other relevant information.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

Thank you for contributing! Your help makes this project better for everyone.
