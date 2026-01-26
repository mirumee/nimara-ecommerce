# Nimara Agent Documentation

This folder contains comprehensive documentation designed for AI agents and developers working with the Nimara project. All documentation is structured to help agents understand the project architecture, contribute effectively, and assist developers.

## 📚 Documentation Structure

### [Getting Started](./01-getting-started.md)
Complete guide for first-time setup and running the project locally. Includes:
- Prerequisites and installation
- Environment configuration
- Running the development server
- Common setup issues

### [Contributing Guide](./02-contributing.md)
How to contribute to the open-source project and add new features:
- Project structure overview
- Architecture principles
- Adding new features
- Adding new integrations/providers
- Testing guidelines
- Pull request process

### [Customization Guide](./03-customization.md)
How to use Nimara as a starter template for your own storefront or marketplace:
- Project initialization
- Overriding components and features
- Customizing theme and branding
- Adding custom pages
- Provider configuration
- Deployment setup

### [Vision & Roadmap](./04-vision.md)
The future direction of Nimara:
- North Star goals
- Current roadmap milestones
- Planned features
- Architecture evolution

### [Code Style Guide](./05-code-style.md)
Comprehensive coding conventions and style guide:
- TypeScript conventions
- React patterns
- Import organization
- Naming conventions
- File structure
- Linting and formatting rules

## 🎯 Quick Reference

### For First-Time Users
Start with [Getting Started](./01-getting-started.md) to set up your development environment.

### For Contributors
Read [Contributing Guide](./02-contributing.md) to understand how to add features and contribute to the project.

### For Customization
See [Customization Guide](./03-customization.md) to adapt Nimara for your own project.

### For Architecture Understanding
Review [Architecture Documentation](../architecture.md) for deep technical details.

## 🤖 Agent Guidelines

When helping with Nimara:

1. **Always respect architecture boundaries**: Packages must never import from apps
2. **Use dependency injection**: Features depend on providers/ports, not implementations
3. **Follow the override pattern**: Use overrides instead of modifying packages directly
4. **Maintain code style**: Follow the conventions in [Code Style Guide](./05-code-style.md)
5. **Check recipes**: Configuration is driven by `nimara.recipe.yaml`
6. **Use action factories**: Server actions should follow the factory + wrapper pattern

## 📖 Additional Resources

- [Architecture Documentation](../architecture.md) - Complete architecture reference
- [Developer Configuration Guide](../tutorials/developer-configuration-guide.md) - Detailed configuration options
- [Nimara Docs All](../nimara-docs-all.md) - Consolidated documentation
