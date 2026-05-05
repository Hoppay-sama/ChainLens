FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the Hardhat project
COPY . .

# Expose the default Hardhat Network port
EXPOSE 8545

# Start the local Hardhat node, binding to all interfaces so it is accessible from other containers
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
