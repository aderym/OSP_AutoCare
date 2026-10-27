FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install --global pnpm@11.25.0 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec vite build --config standalone/vite.config.ts
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/app/runtime/osp-autocare.sqlite
COPY --from=build /app/standalone-dist ./standalone-dist
COPY lib/api.ts lib/workorder.ts lib/technician.ts lib/assistant.ts lib/assistant-knowledge.ts lib/vehicle-map.ts ./lib/
COPY standalone/server.ts standalone/database.ts ./standalone/
COPY drizzle ./drizzle
RUN mkdir -p runtime && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node","--experimental-strip-types","standalone/server.ts"]
