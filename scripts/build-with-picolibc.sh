#!/bin/bash
# Build script for kernel with picolibc

set -e

# Paths
PICOLIBC_INSTALL="$(pwd)/picolibc-install"
BUILD_DIR="build"
OUT_DIR="$BUILD_DIR/out"

# Check if picolibc is installed
if [ ! -d "$PICOLIBC_INSTALL" ]; then
    echo "Error: Picolibc not found at $PICOLIBC_INSTALL"
    echo "Please run ./build-picolibc.sh first"
    exit 1
fi

# Create build directories
mkdir -p "$BUILD_DIR"
mkdir -p "$OUT_DIR"

# Compiler flags
CFLAGS="-m32 -march=i686 -ffreestanding -nostdlib -fno-builtin"
CFLAGS="$CFLAGS -I$PICOLIBC_INSTALL/include"
CFLAGS="$CFLAGS -I./src/lib"
CFLAGS="$CFLAGS -I./src"
CFLAGS="$CFLAGS -Wall -Wextra"

LDFLAGS="-m elf_i386 -nostdlib"
LDFLAGS="$LDFLAGS -L$PICOLIBC_INSTALL/lib"

echo "=== Building kernel with picolibc ==="

# Build boot assembly
echo "Assembling boot code..."
nasm -f elf32 src/boot/kernel.asm -o "$BUILD_DIR/kasm.o"

# Build duktape with picolibc
echo "Building Duktape..."
gcc $CFLAGS -c src/lib/duktape.c -o "$BUILD_DIR/duktape.o"

# Build kernel
echo "Building kernel..."
gcc $CFLAGS -c src/kernel/kernel.c -o "$BUILD_DIR/kc.o"

# Link everything together
echo "Linking kernel..."
ld $LDFLAGS -T src/link.ld -o "$OUT_DIR/kernel" \
    "$BUILD_DIR/kasm.o" \
    "$BUILD_DIR/kc.o" \
    "$BUILD_DIR/duktape.o" \
    -lc

echo ""
echo "=== Build complete! ==="
echo "Kernel binary: $OUT_DIR/kernel"
echo ""
echo "To run the kernel:"
echo "  qemu-system-i386 -kernel $OUT_DIR/kernel"
