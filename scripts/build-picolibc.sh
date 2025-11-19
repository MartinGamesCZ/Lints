#!/bin/bash
# Script to build picolibc for i686 freestanding environment

set -e

PICOLIBC_DIR="picolibc"
BUILD_DIR="build/picolibc"
INSTALL_DIR="$(pwd)/picolibc-install"

echo "=== Building Picolibc for i686 freestanding ==="

# Check if picolibc exists
if [ ! -d "$PICOLIBC_DIR" ]; then
    echo "Error: Picolibc source not found at $PICOLIBC_DIR"
    echo "Cloning..."
    git clone --branch 1.8.10 https://github.com/picolibc/picolibc.git "$PICOLIBC_DIR"
fi

# Get current version
cd "$PICOLIBC_DIR"
CURRENT_VERSION=$(git describe --tags 2>/dev/null || echo "unknown")
echo "Using picolibc version: $CURRENT_VERSION"
cd ..

# Create build directory
mkdir -p "$BUILD_DIR"

echo "Configuring picolibc with meson..."
meson setup "$BUILD_DIR" "$PICOLIBC_DIR" \
    --cross-file picolibc-i686.txt \
    --prefix="$INSTALL_DIR" \
    --wipe \
    -Dmultilib=false \
    -Dpicocrt=false \
    -Dsemihost=false \
    -Dspecsdir=none \
    -Dtinystdio=true \
    -Dio-long-long=true \
    -Dformat-default=double \
    -Dtests=false

echo "Building picolibc..."
meson compile -C "$BUILD_DIR"

echo "Installing picolibc..."
meson install -C "$BUILD_DIR"

echo ""
echo "=== Picolibc build complete! ==="
echo "Installation directory: $INSTALL_DIR"
echo ""
echo "To use picolibc in your kernel:"
echo "  Include path: -I$INSTALL_DIR/include"
echo "  Library path: -L$INSTALL_DIR/lib"
echo "  Link with: -lc"
