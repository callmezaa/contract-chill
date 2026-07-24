# Stage 1: Install all dependencies at monorepo root
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY shared/package.json ./shared/
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm ci

# Stage 2: Build shared library (must be built before client & server)
FROM deps AS shared-builder
WORKDIR /app
COPY shared/ ./shared/
RUN npm run build -w shared

# Stage 3: Build client
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/shared ./shared
COPY package*.json ./
COPY client/ ./client/
RUN npm run build -w client

# Stage 4: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/shared ./shared
COPY package*.json ./
COPY server/ ./server/
RUN npm run build -w server

# Stage 5: Runner — production only
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/shared/dist ./shared/dist
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist
COPY server/package*.json ./server/

USER nodeuser

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "server/dist/index.js"]