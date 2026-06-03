FROM oven/bun:1-alpine
WORKDIR /app

# Install dependencies (and generate Prisma client via postinstall)
COPY package.json ./
COPY prisma ./prisma
RUN bun install

# Application source
COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5004
CMD ["bun", "run", "src/server.ts"]
