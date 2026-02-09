# Coding Standards

## Linting & Formatting

### Running Linters
- Run all linters: `bun run lint`
- Lint frontend only: `bun run --filter frontend lint`
- Lint backend only: `bun run --filter backend lint`

### Formatting Code
- Format all code: `bun run format`
- Format frontend only: `bun run --filter frontend format`
- Format backend only: `bun run --filter backend format`

### Editor Integration
- VSCode settings in `.vscode/settings.json` enable format on save
- ESLint auto-fixes on save

## Frontend

### Adding UI Components
- Use `bunx --bun shadcn@latest add <component>` to add shadcn/ui components
- Run from the `frontend/` directory
- Example: `bunx --bun shadcn@latest add button`

## Backend (Hono)

- Only use `app.route` in [index.ts](backend/src/index.ts)
- Define route handlers in separate files under `routes/`
- Use middleware for shared features

## DTOs

- Live in separate workspace package (shared by frontend/backend)
- Define as Zod schemas, export types with `z.infer<typeof schema>`
- Use `.partial()`, `.omit()`, `.pick()`, `.extend()`, `.merge()` for DRY schemas
