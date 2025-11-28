mkdir -p out
mkdir -p out/core
mkdir -p out/img/EFI/BOOT


clang -target x86_64-pc-win32-coff -fno-stack-protector -fshort-wchar -mno-red-zone -c core/src/efi.c -o out/core/efi.o
clang -target x86_64-pc-win32-coff -fno-stack-protector -fshort-wchar -mno-red-zone -c core/src/main.c -o out/core/main.o

lld-link -filealign:16 -subsystem:efi_application -nodefaultlib -dll -entry:efi_main out/core/main.o out/core/efi.o -out:out/img/EFI/BOOT/BOOTX64.EFI
