#!/bin/bash
# Quick start script - builds picolibc and kernel, then runs it

set -e

echo "=========================================="
echo "  Kernel with Picolibc - Quick Start"
echo "=========================================="
echo ""

# Check for required tools
echo "Checking prerequisites..."

command -v gcc >/dev/null 2>&1 || { echo "Error: gcc not found"; exit 1; }
command -v nasm >/dev/null 2>&1 || { echo "Error: nasm not found"; exit 1; }
command -v ld >/dev/null 2>&1 || { echo "Error: ld not found"; exit 1; }
command -v qemu-system-i386 >/dev/null 2>&1 || { echo "Error: qemu-system-i386 not found"; exit 1; }

if ! command -v meson >/dev/null 2>&1; then
    echo "Warning: meson not found"
    echo "Install with: pip install --user meson ninja"
    echo "or: sudo apt install meson ninja-build"
    exit 1
fi

echo "✓ All prerequisites found"
echo ""

# Build picolibc if not already built
if [ ! -d "picolibc-install" ]; then
    echo "Step 1: Building picolibc (this may take a few minutes)..."
    ./build-picolibc.sh
else
    echo "Step 1: Picolibc already built (skipping)"
fi

echo ""
echo "Step 2: Building kernel..."
make kernel

echo ""
echo "Step 3: Running kernel in QEMU..."
echo "(Press Ctrl+A then X to exit QEMU)"
echo ""
sleep 2

make run
