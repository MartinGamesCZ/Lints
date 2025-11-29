mkdir -p out
mkdir -p out/core
mkdir -p out/img/EFI/BOOT
mkdir -p out/lib

clang -target x86_64-pc-win32-coff -fno-stack-protector -fshort-wchar -mno-red-zone -Iedk2/MdePkg/Include -Iedk2/MdePkg/Include/X64 -c core/src/efi.c -o out/core/efi.o
clang -target x86_64-pc-win32-coff -fno-stack-protector -fshort-wchar -mno-red-zone -Icore/compat -Icore/lib/duktape/src -Iedk2/MdePkg/Include -Iedk2/MdePkg/Include/X64 -Iedk2/CryptoPkg/Library/Include -c core/src/main.c -o out/core/main.o
clang -target x86_64-pc-win32-coff -fno-stack-protector -fshort-wchar -mno-red-zone -DDUK_F_GENERIC -U_WIN32 -UWIN32 -U_WIN64 -UWIN64 -Icore/compat -Iedk2/MdePkg/Include -Iedk2/MdePkg/Include/X64 -Iedk2/CryptoPkg/Library/Include -c core/lib/duktape/src/duktape.c -o out/lib/duktape.o
clang -target x86_64-pc-win32-coff -fno-stack-protector -fshort-wchar -mno-red-zone -Icore/compat -Iedk2/MdePkg/Include -Iedk2/MdePkg/Include/X64 -Iedk2/CryptoPkg/Library/Include -c core/src/compat.c -o out/core/compat.o

lld-link -filealign:16 -subsystem:efi_application -nodefaultlib -dll -entry:efi_main out/core/main.o out/core/efi.o out/lib/duktape.o out/core/compat.o -out:out/img/EFI/BOOT/BOOTX64.EFI
