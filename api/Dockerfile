FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

# Data directory for the persistent SQLite file
RUN mkdir -p /data
ENV DATABASE_PATH=/data/audify.db
ENV PORT=3001

EXPOSE 3001
CMD ["sh", "-c", "node dist/seed.js && node dist/index.js"]
