# pxl-portal

Next.js portal for PXL Automation.

## Stack

- Next.js App Router
- TypeScript
- React Query
- Tailwind CSS
- shadcn/ui-style components

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create local environment values:

   ```bash
   cp .env.example .env.local
   ```

3. Set the API URL:

   ```text
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

The portal expects `pxl-api` to be running and available at `NEXT_PUBLIC_API_URL`.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
