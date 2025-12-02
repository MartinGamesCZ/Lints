#include "main.h" 
#include "efi.h" 
#include "efi.h" 
#include <Protocol/CpuIo2.h> 
#include <Protocol/PciRootBridgeIo.h>
#include "duktape.h"
#include "embedded_js.h"

duk_context *ctx;
EFI_SYSTEM_TABLE* systemTable;

void halt() {
  for (;;) {}
}

void ascii_to_utf16(const char *ascii, CHAR16 *utf16) {
  while (*ascii) {
    *utf16++ = (CHAR16)*ascii++;
  }
  *utf16 = 0;
}

duk_ret_t native_systable_conout_output_string(duk_context *ctx) {
  CHAR16 buffer[256];
  ascii_to_utf16(duk_safe_to_string(ctx, 0), buffer);
  systemTable->ConOut->OutputString(systemTable->ConOut, buffer);
  
  return 0;
}

duk_ret_t native_systable_conout_clear_screen(duk_context *ctx) {
  systemTable->ConOut->ClearScreen(systemTable->ConOut);
  return 0;
}

duk_ret_t native_systable_conout_set_attribute(duk_context *ctx) {
  systemTable->ConOut->SetAttribute(systemTable->ConOut, duk_to_uint(ctx, 0));
  return 0;
}


duk_ret_t native_systable_io_dword_in(duk_context *ctx) {
  EFI_CPU_IO2_PROTOCOL* cpuIo;
  EFI_GUID cpuIoGuid = EFI_CPU_IO2_PROTOCOL_GUID;
  systemTable->BootServices->LocateProtocol(&cpuIoGuid, NULL, (void**)&cpuIo);

  UINT32 data;
  cpuIo->Io.Read(cpuIo, EfiCpuIoWidthUint32, duk_to_uint(ctx, 0), 1, &data);
  duk_push_uint(ctx, data);
  return 1;
}

duk_ret_t native_systable_io_dword_out(duk_context *ctx) {
  EFI_CPU_IO2_PROTOCOL* cpuIo;
  EFI_GUID cpuIoGuid = EFI_CPU_IO2_PROTOCOL_GUID;
  systemTable->BootServices->LocateProtocol(&cpuIoGuid, NULL, (void**)&cpuIo);

  UINT32 data = duk_to_uint(ctx, 1);
  cpuIo->Io.Write(cpuIo, EfiCpuIoWidthUint32, duk_to_uint(ctx, 0), 1, &data);
  return 0;
}

duk_ret_t native_systable_pci_read_config(duk_context *ctx) {
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL* pci;
  EFI_GUID pciGuid = EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_GUID;
  systemTable->BootServices->LocateProtocol(&pciGuid, NULL, (void**)&pci);

  UINT64 bus = duk_to_uint(ctx, 0);
  UINT64 device = duk_to_uint(ctx, 1);
  UINT64 func = duk_to_uint(ctx, 2);
  UINT64 offset = duk_to_uint(ctx, 3);
  UINT64 address = (bus << 24) | (device << 16) | (func << 8) | (offset & 0xff);
  UINT32 data = 0;

  pci->Pci.Read(pci, EfiPciWidthUint32, address, 1, &data);

  duk_push_uint(ctx, data);
  return 1;
}

duk_ret_t native_systable_pci_write_config(duk_context *ctx) {
  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL* pci;
  EFI_GUID pciGuid = EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_GUID;
  systemTable->BootServices->LocateProtocol(&pciGuid, NULL, (void**)&pci);

  UINT64 bus = duk_to_uint(ctx, 0);
  UINT64 device = duk_to_uint(ctx, 1);
  UINT64 func = duk_to_uint(ctx, 2);
  UINT64 offset = duk_to_uint(ctx, 3);
  UINT64 address = (bus << 24) | (device << 16) | (func << 8) | (offset & 0xff);
  UINT32 data = duk_to_uint(ctx, 4);

  pci->Pci.Write(pci, EfiPciWidthUint32, address, 1, &data);

  return 0;
}

int kernel_main(EFI_SYSTEM_TABLE *st) {
  systemTable = st;
  systemTable->ConOut->ClearScreen(systemTable->ConOut);
  systemTable->ConOut->OutputString(systemTable->ConOut, L"START\r\n");

  ctx = duk_create_heap_default();

  duk_push_c_function(ctx, native_systable_conout_output_string, 1);
  duk_put_global_string(ctx, "$___native_systable_conout_outputString");

  duk_push_c_function(ctx, native_systable_conout_clear_screen, 0);
  duk_put_global_string(ctx, "$___native_systable_conout_clearScreen");

  duk_push_c_function(ctx, native_systable_conout_set_attribute, 1);
  duk_put_global_string(ctx, "$___native_systable_conout_setAttribute");

  duk_push_c_function(ctx, native_systable_io_dword_in, 1);
  duk_put_global_string(ctx, "$___native_systable_io_dword_in");

  duk_push_c_function(ctx, native_systable_io_dword_out, 2);
  duk_put_global_string(ctx, "$___native_systable_io_dword_out");

  duk_push_c_function(ctx, native_systable_pci_read_config, 4);
  duk_put_global_string(ctx, "$___native_systable_pci_read_config");

  duk_push_c_function(ctx, native_systable_pci_write_config, 5);
  duk_put_global_string(ctx, "$___native_systable_pci_write_config");

  systemTable->ConOut->OutputString(systemTable->ConOut, L"RUN\r\n");

  duk_push_string(ctx, EMBEDDED_JS);
  duk_int_t returnCode = duk_peval(ctx);

  /*if (returnCode != 0)
  {
    duk_safe_to_stacktrace(ctx, -1);

    CHAR16 buffer[256];
    ascii_to_utf16(duk_safe_to_string(ctx, -1), buffer);
    systemTable->ConOut->OutputString(systemTable->ConOut, buffer);
  }

  duk_pop(ctx);*/

  systemTable->ConOut->OutputString(systemTable->ConOut, L"!!! KERNEL EXITED UNEXPECTEDLY !!!\r\n");

  halt();

  return 0;
}
