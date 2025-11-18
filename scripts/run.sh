#!/bin/bash
# Build and run kernel with picolibc

set -e

# Paths
PICOLIBC_INSTALL="$(pwd)/picolibc-install"
BUILD_DIR="build"
OUT_DIR="$BUILD_DIR/out"

# Check if picolibc is installed
if [ ! -d "$PICOLIBC_INSTALL" ]; then
    echo "Error: Picolibc not found at $PICOLIBC_INSTALL"
    echo "Please run: make picolibc"
    exit 1
fi

# Create build directories
mkdir -p "$BUILD_DIR"
mkdir -p "$OUT_DIR"

# Copy JavaScript source to build directory
cp src/os/index.js build/

# Generate embedded JavaScript header
echo "Generating embedded JavaScript..."
python3 scripts/embed_js.py build/index.js > "$BUILD_DIR/embedded_js.h"

# Compiler flags
CFLAGS="-m32 -march=i686 -ffreestanding -nostdlib -fno-builtin"
CFLAGS="$CFLAGS -I$PICOLIBC_INSTALL/include"
CFLAGS="$CFLAGS -I./src/lib"
CFLAGS="$CFLAGS -I./src"
CFLAGS="$CFLAGS -I$BUILD_DIR"
CFLAGS="$CFLAGS -Wall -Wextra"

LDFLAGS="-m elf_i386 -nostdlib"
LDFLAGS="$LDFLAGS -L$PICOLIBC_INSTALL/lib"

# Get libgcc path
LIBGCC=$(gcc -m32 -print-libgcc-file-name)

echo "=== Building kernel with picolibc ==="

# Build boot assembly
echo "Assembling boot code..."
nasm -f elf32 src/boot/kernel.asm -o "$BUILD_DIR/kasm.o"

# Build duktape
echo "Building Duktape..."
gcc $CFLAGS -c src/lib/duktape.c -o "$BUILD_DIR/duktape.o"

# Build kernel
echo "Building kernel..."
gcc $CFLAGS -c src/kernel/kernel.c -o "$BUILD_DIR/kc.o"

# Build syscalls
echo "Building syscalls..."
gcc $CFLAGS -c src/lib/syscalls.c -o "$BUILD_DIR/syscalls.o"

# Link everything together
echo "Linking kernel..."
ld $LDFLAGS -T src/link.ld -o "$OUT_DIR/kernel" \
    "$BUILD_DIR/kasm.o" \
    "$BUILD_DIR/kc.o" \
    "$BUILD_DIR/duktape.o" \
    "$BUILD_DIR/syscalls.o" \
    -lc "$LIBGCC"

echo ""
echo "=== Build complete! ==="
echo ""
echo "Running kernel in QEMU..."
echo "(Press Ctrl+A then X to exit)"
echo ""

qemu-system-i386 -kernel "$OUT_DIR/kernel"