# Stage 1: Build the Vite app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

# Run Vite build
RUN npm run build

# Stage 2: Serve the built app
FROM node:18-alpine AS production

WORKDIR /app

# Install 'serve' for serving the app
RUN npm install -g serve

COPY --from=build /app/dist /app/dist

# Expose port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]
