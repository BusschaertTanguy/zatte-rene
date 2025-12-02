# ----------------------------
# Build stage
# ----------------------------
FROM node:24 AS builder

WORKDIR /app

# Install build tools for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

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

# Install Audio dependencies
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    libopus0 \
    && rm -rf /var/lib/apt/lists/*

# Copy built app and node_modules
COPY --from=builder /app ./

ENV NODE_ENV=production

# Start the bot
CMD ["node", "index.js"]
