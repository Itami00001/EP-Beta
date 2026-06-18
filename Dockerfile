FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package files and prisma schema (layer cache)
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (incl. devDeps for ts-node seed)
RUN npm install

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Entrypoint: push DB schema, run seed, then start app
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts && npm start"]
