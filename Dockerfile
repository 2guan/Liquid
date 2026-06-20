# ── 微醺时刻 · The Sip & Sigh — production image ───────────────────────────
# Multi-stage build on the Next.js "standalone" output: the final image carries
# only the traced server bundle, static assets and public/ (incl. the self-hosted
# Chinese font), so it stays small and starts fast.

# 1) Install dependencies (cached on package*.json)
FROM node:20-alpine AS deps
WORKDIR /app
# libc6-compat: glibc shim some Next.js/SWC binaries expect on Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# 2) Build the app
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DeepSeek keys are read at request time (server runtime), NOT baked at build,
# so no secrets are needed here — they're injected by docker-compose at runtime.
RUN npm run build

# 3) Minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# run as an unprivileged user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# standalone server + the assets it does not bundle itself
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js is emitted by Next's standalone output
CMD ["node", "server.js"]
