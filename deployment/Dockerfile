FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install --global pnpm@11.25.0 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec vite build --config standalone/vite.config.ts

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/app/runtime/osp-autocare.sqlite
# Copy the complete server module tree: avoids missing newly imported modules.
COPY --from=build /app/standalone-dist ./standalone-dist
COPY --from=build /app/lib ./lib
COPY --from=build /app/standalone ./standalone
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/public ./public
COPY --from=build /app/data/snapshots ./data/snapshots
COPY --from=build /app/scripts/restore-test-db.mjs ./scripts/restore-test-db.mjs
RUN mkdir -p runtime && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node","--experimental-strip-types","standalone/server.ts"]
