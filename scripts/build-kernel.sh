#!/bin/bash
# Build and run kernel with picolibc

set -e

mkdir -p lib

./scripts/get_duktape.sh

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

# Build TypeScript to JavaScript
cd src/os
echo "Compiling TypeScript to JavaScript..."
bun build --outdir ../../build --target node --bundle src/index.ts
cd ../../

# Generate embedded JavaScript header
echo "Generating embedded JavaScript..."
bun scripts/build_js.js
python3 scripts/embed_js.py build/index.js > "$BUILD_DIR/embedded_js.h"


# Compiler flags
CFLAGS="-m32 -march=i686 -ffreestanding -nostdlib -fno-builtin"
CFLAGS="$CFLAGS -mno-sse -mno-sse2 -mno-mmx -mno-3dnow"
CFLAGS="$CFLAGS -I$PICOLIBC_INSTALL/include"
CFLAGS="$CFLAGS -I./lib/duktape/src"
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

# Build interrupt assembly
echo "Assembling interrupt handlers..."
nasm -f elf32 src/kernel/interrupt/interrupt.asm -o "$BUILD_DIR/interrupt.o"

# Build duktape
echo "Building Duktape..."
gcc $CFLAGS -c lib/duktape/src/duktape.c -o "$BUILD_DIR/duktape.o"

# Build interrupt system
echo "Building interrupt system..."
gcc $CFLAGS -c src/kernel/interrupt/idt.c -o "$BUILD_DIR/idt.o"
gcc $CFLAGS -c src/kernel/interrupt/isr.c -o "$BUILD_DIR/isr.o"

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
    "$BUILD_DIR/interrupt.o" \
    "$BUILD_DIR/idt.o" \
    "$BUILD_DIR/isr.o" \
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