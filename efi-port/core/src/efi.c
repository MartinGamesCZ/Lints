#include "efi.h"
#include "main.h"

int efi_main(void *imageHandle, EfiSystemTable* systemTable) {
    return kernel_main(systemTable);
}