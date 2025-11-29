#include "efi.h"
#include "main.h"

extern EFI_BOOT_SERVICES *gBS;

EFI_STATUS EFIAPI efi_main(EFI_HANDLE ImageHandle, EFI_SYSTEM_TABLE *SystemTable) {
    gBS = SystemTable->BootServices;
    
    // Initialize standard library (if needed)
    // ...
    return kernel_main(SystemTable);
}