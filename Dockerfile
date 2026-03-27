# --- Hugging Face Spaces Dockerfile ---
# Base image with Node.js
FROM node:20-slim

# Install system dependencies for Chromim and FFmpeg (Required for Remotion)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libnss3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Environment settings for Hugging Face Spaces
ENV PORT=7860
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port required by Hugging Face
EXPOSE 7860

# Start command
CMD ["npm", "start"]
