# syntax=docker/dockerfile:1

# ── Stage 1: install production dependencies ────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy only the dependency manifests first so Docker can cache this layer.
# `npm ci` installs exactly what package-lock.json says (reproducible);
# --omit=dev skips nodemon / socket.io-client (dev-only packages).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: small runtime image ────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

# production mode: the error handler stops sending dev-style error details.
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run as the unprivileged "node" user that ships with the official image,
# not as root.
USER node

# Documentation only: the app listens on $PORT (5000 by default).
EXPOSE 5000

# NOTE: no .env is copied in. Secrets (MONGODB_URI, JWT_SECRET, ...) are
# injected at runtime by docker-compose.yml.
CMD ["node", "server.js"]
