# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the source files
COPY . .

# Build TypeScript
RUN npm run build

# Expose port your app runs on (adjust if your app listens to a different port)
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
