# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

# package-lock.json kopyalanmıyor: macOS lockfile Linux native binary'lerini içermiyor
# npm install ile Linux platformuna uygun optional dependency'ler otomatik yüklenir
COPY package.json ./
RUN npm install

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build time env — runtime'da override edilecek
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx next build

# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Güvenlik: root olmayan kullanıcı (OCP uyumlu)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Standalone output'u kopyala
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Runtime env variable'ları — OCP'de ConfigMap/Secret ile inject edilir:
# BACKEND_URL, MOCK_MODE

CMD ["node", "server.js"]
