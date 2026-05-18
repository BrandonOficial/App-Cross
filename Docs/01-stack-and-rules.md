# 01 Stack and Rules

## Tech Stack
### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **State Management**: Zustand (for active workout state) + React Query (for server state)
- **Routing**: React Router
- **Charts**: Recharts

### Backend
- **Framework**: NestJS (with Fastify for high performance)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching/Session**: Redis (for JWT/Sessions)
- **Validation**: Zod / Class-Validator

## Core Rules
1. **Mobile-First Approach**: The UI must be optimized for mobile devices first, focusing on easy touch targets and bottom navigation.
2. **Component-Driven Architecture**: Adhere strictly to the atomic design principles outlined in `04-build-setup.md` (ui vs layout).
3. **Strict TypeScript**: No `any` types. Enforce strict typing across both frontend and backend.
4. **Domain-Driven Design (DDD)**: Backend modules and frontend features must be isolated by domain (auth, users, exercises, routines, workouts) to ensure scalability.
5. **Clean Code**: Follow SOLID principles. Keep functions small and focused. Use custom hooks for complex frontend logic.
