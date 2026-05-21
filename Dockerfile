# Stage 1: Build React Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Node/TypeScript Backend
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port (Cloud Run sets PORT, which our Express server reads)
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "server/dist/index.js"]
