# Use official Node.js image
FROM node:20-alpine AS builder

WORKDIR /app

# Build Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Setup Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Create final production image
FROM node:20-alpine

WORKDIR /app/backend

# Copy backend files
COPY --from=builder /app/backend /app/backend

# Copy built frontend files
COPY --from=builder /app/frontend/dist /app/frontend/dist

# Expose backend port
EXPOSE 5001

# Set production environment variable
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
