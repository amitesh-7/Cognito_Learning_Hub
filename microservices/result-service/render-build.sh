#!/bin/bash
# Build script for result-service on Render
# Installs dependencies for both result-service and shared modules

echo "📦 Installing result-service dependencies..."
npm install

echo "📦 Installing shared module dependencies..."
cd ../shared
npm install

echo "✅ Build complete!"
