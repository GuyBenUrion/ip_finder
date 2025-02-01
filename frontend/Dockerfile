FROM node:18-alpine

# Set the working directory
WORKDIR /app

# install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start react app
CMD ["npm", "start"]
