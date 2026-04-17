FROM node:20-slim
RUN npm install -g pnpm@latest
WORKDIR /app

# Poora root copy karna zaroori hai Monorepo ke liye
COPY . .

# Catalog errors ko khatam karne ke liye settings
RUN pnpm config set link-workspace-packages true
RUN pnpm install --no-frozen-lockfile

WORKDIR /app/artifacts/admin
EXPOSE 3000 5179 5180 5181 5200
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
