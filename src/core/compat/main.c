#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdarg.h>
#include "stdio.h"
#include "quickjs.h"

#define NULL ((void*)0)

// EFI definitions
typedef uint64_t EFI_STATUS;
typedef void* EFI_HANDLE;
#define EFI_SUCCESS 0

typedef struct {
    uint64_t signature;
    uint32_t revision;
    uint32_t headerSize;
    uint32_t crc32;
    uint32_t reserved;
} EFI_TABLE_HEADER;

struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL;
typedef EFI_STATUS (*EFI_TEXT_STRING)(
    struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This,
    uint16_t *String
);

typedef EFI_STATUS (*EFI_TEXT_CLEAR_SCREEN)(
    struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This
);

typedef struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL {
    void *reset;
    EFI_TEXT_STRING OutputString;
    void *testString;
    void *queryMode;
    void *setMode;
    void *setAttribute;
    EFI_TEXT_CLEAR_SCREEN ClearScreen;
    void *setCursorPosition;
    void *enableCursor;
    void *mode;
} EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL;

typedef struct EFI_SYSTEM_TABLE {
    EFI_TABLE_HEADER hdr;
    uint16_t *firmwareVendor;
    uint32_t firmwareRevision;
    void *consoleInHandle;
    void *conIn;
    void *consoleOutHandle;
    EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *ConOut;
    void *standardErrorHandle;
    void *stdErr;
    void *runtimeServices;
    void *bootServices;
    uint64_t numberOfTableEntries;
    void *configurationTable;
} EFI_SYSTEM_TABLE;

static EFI_SYSTEM_TABLE *gST = NULL;

static void Print(uint16_t *str) {
    if (gST && gST->ConOut)
        gST->ConOut->OutputString(gST->ConOut, str);
}

static uint16_t *AsciiToUnicode(const char *ascii) {
    static uint16_t buffer[1024];
    int i;
    for (i = 0; ascii[i] && i < 1023; i++) {
        buffer[i] = (uint16_t)ascii[i];
    }
    buffer[i] = 0;
    return buffer;
}

// stdio implementation
int printf(const char *format, ...) {
    char buf[1024];
    va_list ap;
    va_start(ap, format);
    int ret = vsnprintf(buf, sizeof(buf), format, ap);
    va_end(ap);
    Print(AsciiToUnicode(buf));
    return ret;
}

int fprintf(FILE *stream, const char *format, ...) {
    if (stream != stdout && stream != stderr) return 0;
    char buf[1024];
    va_list ap;
    va_start(ap, format);
    int ret = vsnprintf(buf, sizeof(buf), format, ap);
    va_end(ap);
    Print(AsciiToUnicode(buf));
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
        Print(AsciiToUnicode(buf));
        i += chunk;
    }
    return nmemb;
}

int fputc(int c, FILE *stream) {
    if (stream != stdout && stream != stderr) return c;
    char buf[2] = { (char)c, 0 };
    Print(AsciiToUnicode(buf));
    return c;
}

int putchar(int c) {
    return fputc(c, stdout);
}

EFI_STATUS efi_main(EFI_HANDLE ImageHandle, EFI_SYSTEM_TABLE *SystemTable) {
    (void)ImageHandle;
    
    gST = SystemTable;
    gST->ConOut->ClearScreen(gST->ConOut);
    
    Print(L"UEFI QuickJS\r\n");
    Print(L"============\r\n\r\n");
    
    JSRuntime *rt = JS_NewRuntime();
    if (!rt) {
        Print(L"Failed to create runtime\r\n");
        return EFI_SUCCESS;
    }
    
    JSContext *ctx = JS_NewContext(rt);
    if (!ctx) {
        Print(L"Failed to create context\r\n");
        JS_FreeRuntime(rt);
        return EFI_SUCCESS;
    }
    
    Print(L"QuickJS initialized!\r\n\r\n");
    
    // Test Classes
    const char *code = 
        "class Test { "
        "  constructor(val) { this.val = val; } "
        "  getVal() { return this.val; } "
        "} "
        "let t = new Test(42); "
        "t.getVal();";
        
    Print(L"Evaluating code...\r\n");
    
    JSValue val = JS_Eval(ctx, code, strlen(code), "<input>", JS_EVAL_TYPE_GLOBAL);
    
    if (JS_IsException(val)) {
        JSValue ex = JS_GetException(ctx);
        const char *str = JS_ToCString(ctx, ex);
        if (str) {
            printf("Exception: %s\n", str);
            JS_FreeCString(ctx, str);
        } else {
            printf("Exception: [unknown]\n");
        }
        JS_FreeValue(ctx, ex);
    } else {
        const char *str = JS_ToCString(ctx, val);
        if (str) {
            printf("Result: %s\n", str);
            JS_FreeCString(ctx, str);
        } else {
            printf("Result: [unknown]\n");
        }
        JS_FreeValue(ctx, val);
    }
    
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);
    
    Print(L"\r\nSuccess!\r\n");
    Print(L"\r\nPress Ctrl+C...\r\n");
    for(;;);
    
    return EFI_SUCCESS;
}
