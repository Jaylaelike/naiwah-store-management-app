# Learning Skills Reference

## Source Locations
- **UX/UI Reference**: `shadcn-dashboard-landing-template/nextjs-version/` for dashboard layouts and design patterns
- **Agent Skills**: `.agents/skills/` folder (42 skills including authentication, UI, and backend patterns)
- **Legacy Skills**: `.agent/skills/` folder (25 skill files)

---

## Critical Skills for This Project

### 1. Authentication (NextAuth v5 / Auth.js)
**Location**: `.agents/skills/nextauth-authentication/SKILL.md`

Key patterns:
- Use `CredentialsProvider` for username/password authentication
- JWT strategy for stateless sessions
- Role-based access control with `jwt` and `session` callbacks
- Middleware for route protection
- Type extensions for custom user properties (`types/next-auth.d.ts`)

```typescript
// Example: auth.ts configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Credentials({...})],
  session: { strategy: 'jwt' },
  callbacks: { jwt, session, authorized }
});
```

---

### 2. Database (Prisma ORM)
**Location**: `.agent/skills/prisma-expert/SKILL.md`, `.agents/skills/prisma-patterns/`

Key patterns:
- Schema validation: `npx prisma validate`
- Explicit `@relation` with cascade behaviors
- Indexes for frequently queried fields (`@@index`)
- N+1 prevention with `include` and `select`
- Transaction patterns for data integrity

```prisma
// Best practices applied in schema.prisma
model User {
  id String @id @default(cuid())
  @@index([email])
  @@map("users")
}
```

---

### 3. UI Components (shadcn/ui)
**Location**: `.agents/skills/shadcn-ui/SKILL.md`

Key patterns:
- Component installation: `npx shadcn@latest add [component]`
- Form validation: React Hook Form + Zod
- Accessible components via Radix UI primitives
- CSS variables for theming

Required components for this project:
- `button`, `input`, `form`, `card`, `dialog`, `select`, `table`, `toast`

---

### 4. Frontend Patterns
**Location**: `.agents/skills/nextjs-app-router-patterns/`, `.agents/skills/senior-fullstack/`

Key patterns:
- Server Components by default
- Client Components only when needed (`'use client'`)
- Server Actions for forms
- Parallel data fetching

---

## Reference Template
**Location**: `shadcn-dashboard-landing-template/nextjs-version/`

Use this template for:
- Dashboard layout patterns
- Sidebar navigation
- Data table implementations
- Form design patterns
