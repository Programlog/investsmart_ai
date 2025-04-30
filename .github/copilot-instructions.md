# Best Practices for InvestSmart AI Tech Stack

Concise, actionable tips for Next.js, Shadcn UI, Tailwind CSS, Redux Toolkit, Recharts, Prisma, PostgreSQL, and Clerk.

---

## Frontend Best Practices

### Next.js
- Use App Router for faster page loads.
- Pre-render static pages with Static Generation.
- Optimize images using the `<Image>` component.
- Shift heavy logic to server-side rendering.

### Shadcn UI (Radix UI Primitives)
- Create reusable wrappers for Shadcn components.
- Build complex UI with Radix primitives.
- Add keyboard navigation for accessibility.

### Tailwind CSS
- Group related classes like `flex items-center`.
- Move repeated styles to custom components.
- Remove unused styles in production builds.

### Redux Toolkit
- Split state into slices by feature.
- Handle async tasks with thunks.
- Use component state for transient data.

### Recharts
- Limit chart data for faster rendering.
- Wrap charts in `ResponsiveContainer`.
- Store chart data in Redux for reuse.

---

## Backend Best Practices

### Next.js API Routes
- Keep API logic simple and focused.
- Use conditionals for HTTP method handling.
- Handle errors with a shared utility.

### PostgreSQL with Prisma
- Wrap related writes in transactions.
- Speed up queries with database indexes.
- Use Prisma’s types for safer queries.

### Clerk Authentication
- Protect routes with `getAuth` checks.
- Update user data via Clerk webhooks.
- Rely on Clerk hooks for auth state.

---

## General Best Practices

### Performance
- Cache slow API calls like LLM responses.
- Lazy load UI with `dynamic` imports.
- Combine API requests where possible.

### Code Quality
- Enforce linting with ESLint and Prettier.
- Break code into small, reusable modules.
- Add comments to tricky logic sections.

### Security
- Keep secrets in `.env.local` files.
- Check inputs with Zod.
- Use HTTPS in production settings.

### Testing
- Test units with Jest and mocks.
- Run E2E tests using Cypress.
- Simulate external APIs in tests.

### Collaboration
- Work in feature branches with PRs.
- Explain setup steps in `README.md`.
- Review code before merging PRs.