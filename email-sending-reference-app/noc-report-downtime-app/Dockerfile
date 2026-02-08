# Start from the official Node.js LTS base image
FROM node:20-alpine

# Install libc6-compat for SWC binary support
RUN apk add --no-cache libc6-compat

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json before other files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Expose the listening port
EXPOSE 3002

# Set the port environment variable
ENV PORT 3002

# Run npm start script
CMD ["npm", "start"]
