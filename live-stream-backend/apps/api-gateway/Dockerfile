FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY live-stream-backend/package.json live-stream-backend/package.json
COPY live-stream-backend/nest-cli.json live-stream-backend/nest-cli.json
COPY live-stream-backend/tsconfig.json live-stream-backend/tsconfig.json
COPY live-stream-backend/tsconfig.build.json live-stream-backend/tsconfig.build.json
COPY live-stream-backend/apps live-stream-backend/apps

RUN pnpm install --frozen-lockfile
RUN pnpm --filter live-stream-backend exec nest build api-gateway

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/live-stream-backend/dist /app/live-stream-backend/dist

EXPOSE 3001

CMD ["node", "live-stream-backend/dist/apps/api-gateway/main.js"]
