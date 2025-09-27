# Multi-stage build for Next.js app (Node 18 + pnpm via Corepack)

FROM node:18-bullseye-slim AS builder

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Enable pnpm via corepack and align to packageManager in package.json
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Only copy lockfiles and package manifest first for better caching
COPY package.json pnpm-lock.yaml ./

# Ensure system deps for sharp/canvas if used (safe no-ops otherwise)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    build-essential \
    python3 \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies (prod + dev for build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build app
RUN pnpm build


# Runtime image
FROM node:18-bullseye-slim AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
USER nextjs

CMD ["node_modules/.bin/next", "start", "-p", "3000"]


