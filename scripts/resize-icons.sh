#!/bin/bash

# Script to resize app icons to different sizes
# Make sure you have ImageMagick installed: brew install imagemagick

echo "Resizing app icons..."

# Create output directory if it doesn't exist
mkdir -p assets/resized-icons

# Resize main icon to different sizes
echo "Creating 512x512 icon..."
convert assets/icon.png -resize 512x512 assets/resized-icons/icon-512.png

echo "Creating 256x256 icon..."
convert assets/icon.png -resize 256x256 assets/resized-icons/icon-256.png

echo "Creating 128x128 icon..."
convert assets/icon.png -resize 128x128 assets/resized-icons/icon-128.png

echo "Creating 64x64 icon..."
convert assets/icon.png -resize 64x64 assets/resized-icons/icon-64.png

echo "Creating 32x32 icon..."
convert assets/icon.png -resize 32x32 assets/resized-icons/icon-32.png

echo "Creating 16x16 icon..."
convert assets/icon.png -resize 16x16 assets/resized-icons/icon-16.png

echo "Icon resizing complete! Check assets/resized-icons/ directory."
echo ""
echo "Available sizes:"
ls -la assets/resized-icons/
