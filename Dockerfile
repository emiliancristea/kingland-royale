# Root Dockerfile for Fly.io (monorepo)
FROM node:22-slim AS base
WORKDIR /app

# Copy workspace manifests first for efficient layer caching
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/server/package.json packages/server/package.json

# Install all workspaces deps (root + workspaces)
RUN npm ci --no-audit --no-fund

# Bring in the full repo
COPY . .

# Build shared and server
RUN npm --workspace @kingland/shared run build \
 && npm --workspace @kingland/server run build

# Runtime
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "packages/server/dist/index.js"]