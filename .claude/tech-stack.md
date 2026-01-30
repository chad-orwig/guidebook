# Tech Stack

## Deployment
- **Platform**: TrueNas Scale (k3s)
- **Container**: Single pod running frontend + backend
- **Images**: Separate Docker images for frontend and backend

## Architecture
- **Frontend**: TypeScript, Bun runtime
- **Backend**: TypeScript, Bun runtime
- **Communication**: Localhost (frontend ↔ backend within same pod)

## Frameworks
- **Frontend**: React
- **Backend**: Hono

## Database
- **MongoDB**: Document database for character data storage

## UI/Styling
- **shadcn/ui**: Component library (Radix UI + Tailwind CSS)
- **Tailwind CSS**: Utility-first CSS framework

## Runtime
- **Bun**: Package manager, bundler, and runtime for both services
