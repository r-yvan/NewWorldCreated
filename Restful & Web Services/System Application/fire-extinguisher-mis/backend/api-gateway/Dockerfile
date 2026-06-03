FROM oven/bun:1-alpine
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install

# Application source
COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000
CMD ["bun", "run", "src/index.ts"]
