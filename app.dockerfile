# Use the official Node.js 18 LTS image as a base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /home/admin/user/webserver

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Build the application
RUN npm run build

# Expose the port that your application listens on
EXPOSE 8081

# Start the application
CMD ["npm", "start"]
