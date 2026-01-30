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
