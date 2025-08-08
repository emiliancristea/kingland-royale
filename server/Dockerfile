# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/server/package.json packages/server/package.json
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci --no-audit --no-fund && npm --workspace @kingland/shared run build && npm --workspace @kingland/server run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist
COPY --from=build /app/packages/server/dist /app/packages/server/dist
COPY packages/server/package.json packages/server/package.json
COPY package.json package.json
EXPOSE 8080
CMD ["node", "packages/server/dist/index.js"]