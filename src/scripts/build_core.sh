#!/bin/bash
set -e

mkdir -p out
mkdir -p out/core
mkdir -p out/lib
mkdir -p out/lib/quickjs
mkdir -p out/img
mkdir -p out/img/EFI/BOOT

# Compile minilibc
clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -D_GNU_SOURCE \
    -DUEFI \
    -O2 \
    -c src/core/compat/minilibc.c -o out/core/minilibc.o

# Compile QuickJS
clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -Isrc/lib/quickjs \
    -D_GNU_SOURCE \
    -DUEFI \
    -DCONFIG_VERSION=\"2021-03-27\" \
    -DJS_LIMB_BITS=32 \
    -DNDEBUG \
    -O2 \
    -c src/lib/quickjs/cutils.c -o out/lib/quickjs/cutils.o

clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -Isrc/lib/quickjs \
    -D_GNU_SOURCE \
    -DUEFI \
    -DCONFIG_VERSION=\"2021-03-27\" \
    -DJS_LIMB_BITS=32 \
    -DNDEBUG \
    -O2 \
    -c src/lib/quickjs/libunicode.c -o out/lib/quickjs/libunicode.o

clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -Isrc/lib/quickjs \
    -D_GNU_SOURCE \
    -DUEFI \
    -DCONFIG_VERSION=\"2021-03-27\" \
    -DJS_LIMB_BITS=32 \
    -DNDEBUG \
    -O2 \
    -c src/lib/quickjs/libregexp.c -o out/lib/quickjs/libregexp.o

clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -Isrc/lib/quickjs \
    -D_GNU_SOURCE \
    -DUEFI \
    -DCONFIG_VERSION=\"2021-03-27\" \
    -DJS_LIMB_BITS=32 \
    -DNDEBUG \
    -O2 \
    -c src/lib/quickjs/dtoa.c -o out/lib/quickjs/dtoa.o

clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -Isrc/lib/quickjs \
    -D_GNU_SOURCE \
    -DUEFI \
    -DCONFIG_VERSION=\"2021-03-27\" \
    -DJS_LIMB_BITS=32 \
    -DNDEBUG \
    -O2 \
    -c src/lib/quickjs/quickjs.c -o out/lib/quickjs/quickjs.o

# Compile util.c
clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -Isrc/lib/quickjs \
    -D_GNU_SOURCE \
    -DUEFI \
    -DCONFIG_VERSION=\"2021-03-27\" \
    -DJS_LIMB_BITS=32 \
    -DNDEBUG \
    -O2 \
    -c src/core/util.c -o out/core/util.o

# Compile main application
clang -target x86_64-pc-win32-coff \
    -ffreestanding \
    -fno-stack-protector \
    -fshort-wchar \
    -mno-red-zone \
    -Isrc/core/compat \
    -Isrc/lib/quickjs \
    -Iout/system \
    -D_GNU_SOURCE \
    -DUEFI \
    -DCONFIG_VERSION=\"2021-03-27\" \
    -DJS_LIMB_BITS=32 \
    -DNDEBUG \
    -O2 \
    -c src/core/main.c -o out/core/main.o

# Link
lld-link \
    -filealign:16 \
    -subsystem:efi_application \
    -nodefaultlib \
    -dll \
    -entry:efi_main \
    out/core/main.o \
    out/core/util.o \
    out/core/minilibc.o \
    out/lib/quickjs/cutils.o \
    out/lib/quickjs/libunicode.o \
    out/lib/quickjs/libregexp.o \
    out/lib/quickjs/dtoa.o \
    out/lib/quickjs/quickjs.o \
    -out:out/img/EFI/BOOT/bootx64.efi

echo "Built efi app: out/img/EFI/BOOT/bootx64.efi"

