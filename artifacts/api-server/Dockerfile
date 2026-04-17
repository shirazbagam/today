FROM node:20-slim
RUN npm install -g pnpm@latest
WORKDIR /app

# Poora root copy karna zaroori hai Monorepo ke liye
COPY . .

# Catalog errors ko khatam karne ke liye settings
RUN pnpm config set link-workspace-packages true
RUN pnpm install --no-frozen-lockfile

WORKDIR /app/artifacts/api-server
EXPOSE 3000 5179 5180 5181 5200

# Create entrypoint script to sync schema before starting
RUN echo '#!/bin/bash' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "[API] Syncing database schema..."' >> /app/entrypoint.sh && \
    echo 'cd /app && pnpm --filter @workspace/db run push' >> /app/entrypoint.sh && \
    echo 'echo "[API] Schema synced. Starting API server..."' >> /app/entrypoint.sh && \
    echo 'exec pnpm run dev --host 0.0.0.0' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
