# pxl-portal agent notes

Next.js (App Router) + TypeScript frontend for the PXL Automation portal.

- The backend (`pxl-api`) is the source of truth. The portal only displays data
  and sends API requests; it never owns business logic, permissions, or validation.
- API access goes through `lib/api.ts` (an axios instance). Auth state is checked
  client-side via `components/portal/auth-gate.tsx`, but every endpoint is also
  enforced on the backend.
- Follow the conventions in `docs/project-standards.md` (kebab-case routes,
  camelCase fields, PascalCase components).
- Never put private keys or AI provider secrets in frontend env vars; only
  `NEXT_PUBLIC_*` values are safe to expose.

Use the official Next.js documentation for framework APIs.
