# --- Use official Node.js image ---
FROM node:20-alpine

# --- Set working directory ---
WORKDIR /app

# --- Copy dependency files and install production dependencies ---
COPY package*.json ./
RUN npm ci --omit=dev

# --- Copy source code ---
COPY . .

# --- Expose backend port ---
EXPOSE 3000

# --- Run the app ---
CMD ["node", "app/index.js"]
