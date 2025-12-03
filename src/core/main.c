#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdarg.h>
#include "stdio.h"
#include "quickjs.h"
#include "efi.h"
#include "util.h"
#include "system_prog.h"

static EFI_SYSTEM_TABLE *gST = NULL;

void print(uint16_t *str) {
    if (gST && gST->ConOut)
        gST->ConOut->OutputString(gST->ConOut, str);
}

int printf(const char *format, ...) {
  char buf[1024];
  va_list ap;

  va_start(ap, format);
  int ret = vsnprintf(buf, sizeof(buf), format, ap);
  va_end(ap);

  print(AsciiToUnicode(buf));

  return ret;
}

int fprintf(FILE *stream, const char *format, ...) {
  if (stream != stdout && stream != stderr) return 0;

  char buf[1024];
  va_list ap;

  va_start(ap, format);
  int ret = vsnprintf(buf, sizeof(buf), format, ap);
  va_end(ap);

  print(AsciiToUnicode(buf));

  return ret;
}

size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream) {
  if (stream != stdout && stream != stderr) return 0;

  const char *p = ptr;
  size_t total = size * nmemb;
  char buf[1025];
  size_t i = 0;
    
  while (i < total) {
    size_t chunk = total - i;
    if (chunk > 1024) chunk = 1024;
    
    memcpy(buf, p + i, chunk);
    buf[chunk] = 0;
    
    print(AsciiToUnicode(buf));
    i += chunk;
  }
  
  return nmemb;
}

int fputc(int c, FILE *stream) {
  if (stream != stdout && stream != stderr) return c;
  char buf[2] = { (char)c, 0 };

  print(AsciiToUnicode(buf));
  
  return c;
}

int putchar(int c) {
  return fputc(c, stdout);
}

// ------------------------------- Kernel C TS bindings -------------------------------
JSValue jsKCPrintln(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv) {
  if (argc < 1) return JS_ThrowSyntaxError(ctx, "Missing argument");

  const char *str = JS_ToCString(ctx, argv[0]);
  if (!str) return JS_EXCEPTION;

  print(AsciiToUnicode(str));
  print(L"\r\n");

  JS_FreeCString(ctx, str);

  return JS_UNDEFINED;
}

JSValue jsKCClearScreen(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv) {
  gST->ConOut->ClearScreen(gST->ConOut);

  return JS_UNDEFINED;
}

JSValue jsKCPCIReadDword(JSContext *ctx, JSValueConst jsThis, int argc, JSValueConst *argv) {
  if (argc < 1) return JS_ThrowSyntaxError(ctx, "Missing argument");

  uint32_t addr_u32;
  JS_ToUint32(ctx, &addr_u32, argv[0]);
  UINT64 addr = (UINT64)addr_u32; // Ensure type matches EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_PCI_RW's Address parameter

  EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL* pci;
  EFI_GUID pciGuid = EFI_PCI_ROOT_BRIDGE_IO_PROTOCOL_GUID;
  EFI_STATUS status = gST->BootServices->LocateProtocol(&pciGuid, NULL, (void**)&pci);

  if (EFI_ERROR(status)) {
    return JS_ThrowInternalError(ctx, "Failed to locate PCI Root Bridge IO Protocol: %d", status);
  }

  UINT32 data = 0;

  status = pci->Pci.Read(pci, EfiPciWidthUint32, addr, 1, &data);

  return JS_NewUint32(ctx, data);
}

void initKC(JSContext *ctx) {
  JSValue global = JS_GetGlobalObject(ctx);
  JSValue kc = JS_NewObject(ctx);

  JS_SetPropertyStr(ctx, global, "kc", kc);

  JS_SetPropertyStr(ctx, kc, "println", JS_NewCFunction(ctx, jsKCPrintln, "println", 1));
  JS_SetPropertyStr(ctx, kc, "clearScreen", JS_NewCFunction(ctx, jsKCClearScreen, "clearScreen", 0));
  JS_SetPropertyStr(ctx, kc, "pciReadDword", JS_NewCFunction(ctx, jsKCPCIReadDword, "pciReadDword", 1));

  JS_FreeValue(ctx, global);
}

// ------------------------------------- EFI main -------------------------------------
EFI_STATUS efi_main(EFI_HANDLE ImageHandle, EFI_SYSTEM_TABLE *SystemTable) {
    (void)ImageHandle;
    
    gST = SystemTable;
    gST->ConOut->ClearScreen(gST->ConOut);
    
    print(L"Booting LintsOS...\r\n");

    JSRuntime *rt = JS_NewRuntime();
    if (!rt) {
        print(L"!!! Kernel panic: Failed to create runtime !!!\r\n");
        return EFI_SUCCESS;
    }
    
    JSContext *ctx = JS_NewContext(rt);
    if (!ctx) {
        print(L"!!! Kernel panic: Failed to create context !!!\r\n");
        JS_FreeRuntime(rt);
        return EFI_SUCCESS;
    }

    initKC(ctx);
    
    JSValue val;
    JSValue eval_result = JS_Eval(ctx, SYSTEM_PROG_JS, strlen(SYSTEM_PROG_JS), "<input>", JS_EVAL_TYPE_GLOBAL);
    if (JS_IsException(eval_result)) val = eval_result;
    else {
      JS_FreeValue(ctx, eval_result);

      JSValue global_obj = JS_GetGlobalObject(ctx);
      JSValue kentry_func = JS_GetPropertyStr(ctx, global_obj, "KEntry");

      if (JS_IsFunction(ctx, kentry_func)) val = JS_Call(ctx, kentry_func, JS_UNDEFINED, 0, NULL);
      else val = JS_ThrowReferenceError(ctx, "KEntry function not found or not callable");

      JS_FreeValue(ctx, kentry_func);
      JS_FreeValue(ctx, global_obj);
    }
    
    if (JS_IsException(val)) {
      JSValue ex = JS_GetException(ctx);
      const char *str = JS_ToCString(ctx, ex);

      if (str) {
        printf("!!! Kernel panic: %s !!!\n", str);
        JS_FreeCString(ctx, str);
      } else printf("!!! Kernel panic: [unknown] !!!\n");
      
      JS_FreeValue(ctx, ex);
    } else {
      const char *str = JS_ToCString(ctx, val);
      if (str) {
        printf("!!! Kernel panic: %s !!!\n", str);
        JS_FreeCString(ctx, str);
      } else printf("!!! Kernel panic: [unknown] !!!\n");
      
      JS_FreeValue(ctx, val);
    }
    
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);

    for(;;);
    
    return EFI_SUCCESS;
}
