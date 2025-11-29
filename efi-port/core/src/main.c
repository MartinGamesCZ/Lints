#include "main.h" 
#include "efi.h" 
#include "duktape.h"

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

duk_ret_t native_log(duk_context *ctx) {
  CHAR16 buffer[256];
  ascii_to_utf16(duk_safe_to_string(ctx, 0), buffer);
  systemTable->ConOut->OutputString(systemTable->ConOut, buffer);
  
  return 0;
}

int kernel_main(EFI_SYSTEM_TABLE *st) {
  systemTable = st;
  ctx = duk_create_heap_default();

  duk_push_c_function(ctx, native_log, 1);
  duk_put_global_string(ctx, "$log");

  duk_push_object(ctx);

  duk_push_pointer(ctx, (void *)st);
  duk_put_prop_string(ctx, -2, "st");

  duk_put_global_string(ctx, "$st");

  duk_push_string(ctx, "$log($st.st.ConOut)");
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
