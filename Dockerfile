# syntax=docker/dockerfile:1

# ---- Builder: install deps and produce the standalone Next build ----
FROM node:22.13.0-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Update corepack first: the version bundled with Node 22.13 has stale signing
# keys and cannot verify recent pnpm releases ("Cannot find matching keyid").
RUN npm install -g corepack@latest && corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- Runtime: run the standalone server (no pnpm, minimal node_modules) ----
FROM node:22.13.0-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Next's standalone output bundles only the server + traced node_modules.
# static assets and public/ are copied alongside it.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/login').then(()=>process.exit(0)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
