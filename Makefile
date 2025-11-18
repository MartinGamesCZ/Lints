# Makefile for kernel with picolibc
.PHONY: all clean picolibc kernel run help

# Paths
PICOLIBC_INSTALL := $(CURDIR)/picolibc-install
BUILD_DIR := build
OUT_DIR := $(BUILD_DIR)/out
SRC_DIR := src

# Check if picolibc exists
PICOLIBC_EXISTS := $(shell test -d $(PICOLIBC_INSTALL) && echo 1 || echo 0)

# Compiler and flags
CC := gcc
AS := nasm
LD := ld

CFLAGS := -m32 -march=i686 -ffreestanding -nostdlib -fno-builtin
CFLAGS += -I$(PICOLIBC_INSTALL)/include
CFLAGS += -I$(SRC_DIR)/lib
CFLAGS += -I$(SRC_DIR)
CFLAGS += -Wall -Wextra -O2

ASFLAGS := -f elf32

LDFLAGS := -m elf_i386 -nostdlib
LDFLAGS += -L$(PICOLIBC_INSTALL)/lib
LDFLAGS += -T $(SRC_DIR)/link.ld

# Get libgcc path for compiler runtime support
LIBGCC := $(shell $(CC) -m32 -print-libgcc-file-name)

# Object files
OBJS := $(BUILD_DIR)/kasm.o $(BUILD_DIR)/kc.o $(BUILD_DIR)/duktape.o $(BUILD_DIR)/syscalls.o

# Default target
all: check-picolibc kernel

# Help target
help:
	@echo "Makefile for kernel with picolibc"
	@echo ""
	@echo "Targets:"
	@echo "  picolibc    - Download and build picolibc"
	@echo "  kernel      - Build the kernel (requires picolibc)"
	@echo "  run         - Build and run the kernel in QEMU"
	@echo "  clean       - Clean build artifacts"
	@echo "  clean-all   - Clean everything including picolibc"
	@echo "  help        - Show this help message"

# Build picolibc
picolibc:
	@echo "Building picolibc..."
	@chmod +x build-picolibc.sh
	@./build-picolibc.sh

# Check if picolibc is built
check-picolibc:
ifneq ($(PICOLIBC_EXISTS),1)
	@echo "Error: Picolibc not found. Building it now..."
	@$(MAKE) picolibc
endif

# Create build directories
$(BUILD_DIR):
	@mkdir -p $(BUILD_DIR)

$(OUT_DIR): | $(BUILD_DIR)
	@mkdir -p $(OUT_DIR)

# Build boot assembly
$(BUILD_DIR)/kasm.o: $(SRC_DIR)/boot/kernel.asm | $(BUILD_DIR)
	@echo "Assembling boot code..."
	@$(AS) $(ASFLAGS) $< -o $@

# Build duktape
$(BUILD_DIR)/duktape.o: $(SRC_DIR)/lib/duktape.c $(SRC_DIR)/lib/duktape.h | $(BUILD_DIR)
	@echo "Building Duktape..."
	@$(CC) $(CFLAGS) -c $< -o $@

# Build kernel
$(BUILD_DIR)/kc.o: $(SRC_DIR)/kernel/kernel.c | $(BUILD_DIR)
	@echo "Building kernel..."
	@$(CC) $(CFLAGS) -c $< -o $@

# Build syscalls
$(BUILD_DIR)/syscalls.o: $(SRC_DIR)/lib/syscalls.c | $(BUILD_DIR)
	@echo "Building syscalls..."
	@$(CC) $(CFLAGS) -c $< -o $@

# Link kernel
$(OUT_DIR)/kernel: $(OBJS) | $(OUT_DIR)
	@echo "Linking kernel..."
	@$(LD) $(LDFLAGS) -o $@ $(OBJS) -lc $(LIBGCC)
	@echo "Build complete: $@"

# Main kernel target
kernel: check-picolibc $(OUT_DIR)/kernel

# Run in QEMU
run: kernel
	@echo "Running kernel in QEMU..."
	@qemu-system-i386 -kernel $(OUT_DIR)/kernel

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)

# Clean everything including picolibc
clean-all: clean
	@echo "Cleaning picolibc..."
	@rm -rf picolibc picolibc-install

.DEFAULT_GOAL := help
