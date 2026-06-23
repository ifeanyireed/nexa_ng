#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting Nexa Frontend Build & Deploy Pipeline..."

# 1. Navigate to frontend and build
cd frontend
echo "📦 Installing frontend dependencies..."
npm install

echo "🔨 Building Next.js static export..."
npm run build

# 2. Zip the out directory
echo "🗜 Zipping the static files..."
rm -f out.zip
zip -rq out.zip out

# 3. Transfer the zip to the DigitalOcean Droplet
echo "🌐 Uploading out.zip to DigitalOcean droplet (167.99.15.196)..."
scp out.zip root@167.99.15.196:/var/www/nexa_ng/frontend/

# 4. SSH in to extract the files
echo "🔓 Extracting files on the remote server..."
ssh root@167.99.15.196 "cd /var/www/nexa_ng/frontend/ && unzip -oq out.zip && rm out.zip"

echo "✅ Deploy complete! The updated static frontend is now live."
