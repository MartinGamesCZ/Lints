#include "main.h" 
#include "efi.h" 
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

int kernel_main(EFI_SYSTEM_TABLE *st) {
  systemTable = st;
  ctx = duk_create_heap_default();

  duk_push_c_function(ctx, native_systable_conout_output_string, 1);
  duk_put_global_string(ctx, "$___native_systable_conout_outputString");

  duk_push_c_function(ctx, native_systable_conout_clear_screen, 0);
  duk_put_global_string(ctx, "$___native_systable_conout_clearScreen");

  duk_push_c_function(ctx, native_systable_conout_set_attribute, 1);
  duk_put_global_string(ctx, "$___native_systable_conout_setAttribute");

  duk_push_string(ctx, EMBEDDED_JS);
  duk_int_t returnCode = duk_peval(ctx);

  if (returnCode != 0)
  {
    duk_safe_to_stacktrace(ctx, -1);
    CHAR16 buffer[256];
    ascii_to_utf16(duk_safe_to_string(ctx, -1), buffer);
    systemTable->ConOut->OutputString(systemTable->ConOut, buffer);
  }

  duk_pop(ctx);

  halt();

  return 0;
}
