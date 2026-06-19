# Use Node.js 18 alpine image
FROM node:18-alpine

# Install openssl and other prisma requirements in alpine
RUN apk add --no-cache openssl libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies so prisma CLI is available on boot)
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose backend port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start server (runs database push, Excel parsing, and seeds default shopkeeper on boot)
CMD ["node", "server.js"]
