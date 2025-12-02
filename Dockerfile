# ----------------------------
# Build stage
# ----------------------------
FROM node:24 AS builder

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install --production

# Copy the rest of your project
COPY . .

# ----------------------------
# Runtime stage
# ----------------------------
FROM node:24-slim AS runner

WORKDIR /app

# Copy built app and node_modules
COPY --from=builder /app ./

ENV NODE_ENV=production

# Start the bot
CMD ["node", "index.js"]
