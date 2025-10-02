# Contributing to Stripe Integration Boilerplate

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🎯 Ways to Contribute

- **Bug Reports** - Found a bug? Open an issue with details
- **Feature Requests** - Have an idea? Start a discussion
- **Code Contributions** - Submit pull requests for fixes or features
- **Documentation** - Improve docs, examples, or tutorials
- **Testing** - Help test and report edge cases

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/stripe-integration-boilerplate.git
cd stripe-integration-boilerplate

# Add upstream remote
git remote add upstream https://github.com/triepod-ai/stripe-integration-boilerplate.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Stripe test keys to .env
# Get keys from: https://dashboard.stripe.com/test/apikeys

# Set up database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

### 3. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

## 📝 Code Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces (no `any` unless absolutely necessary)
- Use Zod schemas for runtime validation
- Follow existing code patterns

### React Components

- Use functional components with hooks
- Implement proper error boundaries
- Handle loading and error states
- Use `"use client"` directive only when needed (client components)

### API Routes

- Validate all inputs using Zod schemas
- Implement proper error handling
- Use rate limiting for public endpoints
- Return consistent error response format
- Add appropriate security headers

### Security

- Never commit secrets or API keys
- Always validate and sanitize user input
- Verify webhook signatures
- Follow OWASP security best practices

### Code Style

- Run ESLint: `npm run lint`
- Format code: `npm run format` (Prettier)
- Follow existing formatting conventions

## 🧪 Testing

### Before Submitting

```bash
# Run linting
npm run lint

# Run tests
npm test

# Build to verify no errors
npm run build
```

### Writing Tests

- Add tests for new features
- Update tests when modifying existing code
- Aim for good test coverage
- Use descriptive test names

## 📋 Pull Request Process

### 1. Prepare Your Changes

```bash
# Make sure your branch is up to date
git fetch upstream
git rebase upstream/main

# Run quality checks
npm run lint
npm test
npm run build
```

### 2. Commit Your Changes

Use clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "feat: Add subscription cancellation endpoint"
git commit -m "fix: Resolve webhook signature validation issue"
git commit -m "docs: Update deployment guide with Vercel instructions"

# Commit message format
# type: brief description
#
# Types: feat, fix, docs, style, refactor, test, chore
```

### 3. Push and Create PR

```bash
# Push your branch
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
# Fill out the PR template with details
```

### 4. PR Requirements

Your PR should:

- [ ] Have a clear description of changes
- [ ] Reference related issues (if any)
- [ ] Include tests for new functionality
- [ ] Pass all CI checks
- [ ] Follow code style guidelines
- [ ] Update documentation if needed
- [ ] Not include unrelated changes

## 🐛 Bug Reports

When reporting bugs, include:

- **Description** - Clear description of the issue
- **Steps to Reproduce** - Detailed steps to reproduce the bug
- **Expected Behavior** - What should happen
- **Actual Behavior** - What actually happens
- **Environment** - Node version, OS, browser, etc.
- **Screenshots** - If applicable
- **Error Messages** - Full error messages/stack traces

## 💡 Feature Requests

When requesting features:

- **Use Case** - Describe the problem you're trying to solve
- **Proposed Solution** - Your idea for how to solve it
- **Alternatives** - Other solutions you've considered
- **Impact** - Who would benefit from this feature

## 📚 Documentation

Help improve documentation:

- Fix typos or unclear explanations
- Add examples and use cases
- Improve setup instructions
- Create tutorials or guides

## ⚖️ Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and beginners
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## 🔍 Review Process

After submitting a PR:

1. **Automated Checks** - CI will run tests and linting
2. **Code Review** - Maintainers will review your code
3. **Feedback** - You may be asked to make changes
4. **Approval** - Once approved, your PR will be merged

Response times:

- Initial response: Within 3-5 business days
- Reviews: As time permits (this is maintained by volunteers)
- Be patient and respectful

## 🙏 Recognition

Contributors will be:

- Listed in project contributors
- Mentioned in release notes (for significant contributions)
- Thanked in the community

## 📞 Questions?

- **General questions** - Use [GitHub Discussions](https://github.com/triepod-ai/stripe-integration-boilerplate/discussions)
- **Bug reports** - Open an [Issue](https://github.com/triepod-ai/stripe-integration-boilerplate/issues)
- **Security issues** - See [SECURITY.md](SECURITY.md)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**
