# Contributing to ClawHost

Thanks for your interest in contributing! This guide will help you get started.

## Development Setup

Before changing code, read:

- `AGENTS.md`
- `docs/WORKFLOW.md`
- the relevant feature docs

1. Fork and clone the repo
2. Follow the [Quick Start](../README.md#quick-start) guide
3. Create a branch for your feature: `git checkout -b feature/my-feature`

## Code Style

- **TypeScript** - All code must be typed
- **ESLint** - Run `npm run lint` before committing
- **Prettier** - Code is auto-formatted
- **Naming** - Use camelCase for variables, PascalCase for components

## Project Conventions

### File Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
│   ├── ui/        # Reusable UI (shadcn)
│   └── dashboard/ # Feature-specific
└── lib/           # Utilities and services
```

### Components

- Use `'use client'` only when needed (interactivity, hooks)
- Prefer Server Components for data fetching
- Keep components small and focused

### API Routes

- Use `NextResponse.json()` for responses
- Always validate input with Zod
- Handle errors gracefully with proper status codes

### Database

- All schema changes go through Prisma migrations
- Run `npx prisma migrate dev --name description` for changes
- Update seed.ts if adding new reference data

## Making Changes

### Adding a New Feature

1. Check existing issues/discussions first
2. Read the current code path and docs before changing architecture
3. Implement with tests if applicable
4. Update documentation in the same pass
5. Update `ADHD.md` if the current state changed
6. Update Notion if project status, launch stage, or next actions changed
7. Submit PR

### Bug Fixes

1. Create an issue with reproduction steps
2. Reference the issue in your PR
3. Add a test case if possible

### Updating Dependencies

- Don't update major versions without discussion
- Test thoroughly after updates
- Document any breaking changes

## Pull Request Process

1. **Title**: Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
2. **Description**: Explain what and why
3. **Tests**: Ensure existing tests pass
4. **Review**: Wait for approval before merging

### PR Checklist

- [ ] Code follows project style
- [ ] Self-reviewed the changes
- [ ] Updated documentation if needed
- [ ] Updated `ADHD.md` if repo truth changed
- [ ] Updated Notion if status/roadmap/tasks changed
- [ ] No console.log or debug code
- [ ] Tested locally

## Architecture Decisions

Major changes should be discussed in issues first. Consider:

- Performance impact
- Security implications
- Backwards compatibility
- Maintainability

## Truth Source Policy

This repo treats docs and planning as first-class product assets.
If code, tests, docs, and Notion disagree, fix the disagreement before calling the work done.

## Getting Help

- Check existing [documentation](./README.md)
- Search closed issues
- Ask in discussions

## Code of Conduct

Be respectful and constructive. We're all here to build something useful.
