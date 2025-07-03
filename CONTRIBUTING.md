# Contributing to nimara-storefront

Thank you for considering contributing to nimara-storefront!

We welcome all contributions, whether they be code, documentation, bug reports, or any other help you can provide.

## Getting Started

1. **Fork the Repository**:
   - Click the "Fork" button at the top of this repository and clone your fork locally:

     ```bash
     git clone https://github.com/{YOUR_USERNAME}/nimara-storefront.git
     ```

   - Navigate to your local repository:

     ```bash
     cd nimara-storefront
     ```

2. **Set Upstream**:
   - Add the original repository as a remote to keep your fork in sync:

     ```bash
     git remote add upstream https://github.com/mirumee/nimara-storefront.git
     git fetch upstream
     ```

3. **Create a Branch**:
   - Always create a new branch for your work:

     ```bash
     git checkout -b contrib/your-feature-name
     ```

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
     git push origin feature/your-feature-name
     ```

2. **Create a Pull Request (PR)**:
   - Go to the [Pull Requests](https://github.com/mirumee/nimara-storefront/pulls) section of the original repository.
   - Click "New Pull Request".
   - Select your branch and provide a clear, descriptive title and a summary of your changes.

3. **Review Process**:
   - A project maintainer will review your PR and may ask for changes.
   - Once your PR is approved, it will be merged into the main branch.

## Reporting Issues

- If you encounter a bug or have a feature request, please [open an issue](https://github.com/mirumee/nimara-storefront/issues).
- Provide as much information as possible, including steps to reproduce the issue, environment details, and any other relevant information.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

Thank you for contributing! Your help makes this project better for everyone.
