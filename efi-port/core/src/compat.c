#include <Uefi.h>
#include <Library/BaseLib.h>
#include <Library/BaseMemoryLib.h>
#include <Library/MemoryAllocationLib.h>
#include <Library/PrintLib.h>
#include <Library/UefiBootServicesTableLib.h>

// EDK2 CRT Support Header
#include <CrtLibSupport.h>

// Global variables required by CrtLibSupport.h
int errno = 0;
FILE *stderr = NULL;

// Better malloc/free with size tracking
typedef struct {
    size_t size;
    char data[];
} AllocHeader;

void *my_malloc(size_t size) {
    AllocHeader *hdr;
    if (gBS->AllocatePool(EfiLoaderData, size + sizeof(AllocHeader), (void**)&hdr) != EFI_SUCCESS) {
        return NULL;
    }
    hdr->size = size;
    return hdr->data;
}

void my_free(void *ptr) {
    if (ptr) {
        AllocHeader *hdr = (AllocHeader*)((char*)ptr - sizeof(AllocHeader));
        gBS->FreePool(hdr);
    }
}

void *my_realloc(void *ptr, size_t size) {
    if (!ptr) return my_malloc(size);
    if (size == 0) {
        my_free(ptr);
        return NULL;
    }

    AllocHeader *old_hdr = (AllocHeader*)((char*)ptr - sizeof(AllocHeader));
    size_t old_size = old_hdr->size;

    void *new_ptr = my_malloc(size);
    if (!new_ptr) return NULL;

    CopyMem(new_ptr, ptr, old_size < size ? old_size : size);
    my_free(ptr);
    return new_ptr;
}

// Redirect standard malloc/free/realloc to our versions
#undef malloc
#undef free
#undef realloc

void *malloc(size_t size) { return my_malloc(size); }
void free(void *ptr) { my_free(ptr); }
void *realloc(void *ptr, size_t size) { return my_realloc(ptr, size); }

void *calloc(size_t nmemb, size_t size) {
    size_t total = nmemb * size;
    void *ptr = malloc(total);
    if (ptr) {
        SetMem(ptr, total, 0);
    }
    return ptr;
}

// IO
int printf(const char *format, ...) {
    return 0; 
}

int vsnprintf(char *str, size_t size, const char *format, va_list ap) {
    return (int)AsciiVSPrint(str, size, format, ap);
}

int snprintf(char *str, size_t size, const char *format, ...) {
    VA_LIST Marker;
    VA_START(Marker, format);
    UINTN Return = AsciiVSPrint(str, size, format, Marker);
    VA_END(Marker);
    return (int)Return;
}

// sprintf is a macro in CrtLibSupport.h, so we don't define it.


// Math
// Duktape needs math. EDK2 doesn't provide standard math lib.
// We might need to implement simple versions or pull in a math lib.
// For now, stubs.
double floor(double x) { return (double)(int)x; } // Very wrong for negative/large
double ceil(double x) { return (double)(int)x + 1; } 
double fabs(double x) { return x < 0 ? -x : x; }
double pow(double x, double y) { return 0; } // TODO
double sqrt(double x) { return 0; }
double sin(double x) { return 0; }
double cos(double x) { return 0; }
double tan(double x) { return 0; }
double asin(double x) { return 0; }
double acos(double x) { return 0; }
double atan(double x) { return 0; }
double atan2(double y, double x) { return 0; }
double exp(double x) { return 0; }
double log(double x) { return 0; }
double log10(double x) { return 0; }
double fmod(double x, double y) { return 0; }

// Other
void abort(void) {
    // CpuDeadLoop();
    while(1);
}

void exit(int status) {
    // CpuDeadLoop();
    while(1);
}

// Global gBS
EFI_BOOT_SERVICES *gBS = NULL;
int _fltused = 0;

// Stack probe (needed for MSVC ABI)
void __chkstk(void) { return; }

// Memory functions
#undef memset
#undef memcpy
#undef memcmp

void *memset(void *s, int c, size_t n) {
    unsigned char *p = s;
    while (n--) {
        *p++ = (unsigned char)c;
    }
    return s;
}

void *memcpy(void *dest, const void *src, size_t n) {
    char *d = dest;
    const char *s = src;
    while (n--) {
        *d++ = *s++;
    }
    return dest;
}

int memcmp(const void *s1, const void *s2, size_t n) {
    const unsigned char *p1 = s1, *p2 = s2;
    while (n--) {
        if (*p1 != *p2) {
            return *p1 - *p2;
        }
        p1++;
        p2++;
    }
    return 0;
}

void *SetMem(void *Buffer, UINTN Length, UINT8 Value) {
    return memset(Buffer, Value, Length);
}

void *CopyMem(void *Destination, const void *Source, UINTN Length) {
    return memcpy(Destination, Source, Length);
}

INTN CompareMem(const void *Destination, const void *Source, UINTN Length) {
    return (INTN)memcmp(Destination, Source, Length); 
}

// String functions
UINTN AsciiStrnLenS(const CHAR8 *String, UINTN MaxSize) {
    UINTN len = 0;
    while (len < MaxSize && String[len] != 0) {
        len++;
    }
    return len;
}

INTN AsciiStrnCmp(const CHAR8 *FirstString, const CHAR8 *SecondString, UINTN Length) {
    if (Length == 0) return 0;
    while (Length > 0 && *FirstString && *SecondString) {
        if (*FirstString != *SecondString) break;
        FirstString++;
        SecondString++;
        Length--;
    }
    if (Length == 0) return 0;
    return *FirstString - *SecondString;
}

int strcmp(const char *s1, const char *s2) {
    while (*s1 && (*s1 == *s2)) {
        s1++;
        s2++;
    }
    return *(const unsigned char *)s1 - *(const unsigned char *)s2;
}

// Print functions
// Minimal vsnprintf implementation
#include <stdarg.h>
static void simple_append(char **str, size_t *size, char c) {
    if (*size > 1) {
        **str = c;
        (*str)++;
        (*size)--;
    }
}

static void simple_append_str(char **str, size_t *size, const char *s) {
    while (*s) {
        simple_append(str, size, *s++);
    }
}

static void simple_append_hex(char **str, size_t *size, UINT64 num) {
    char buf[17];
    const char *digits = "0123456789ABCDEF";
    int i = 0;
    if (num == 0) {
        simple_append(str, size, '0');
        return;
    }
    while (num > 0) {
        buf[i++] = digits[num % 16];
        num /= 16;
    }
    while (i > 0) {
        simple_append(str, size, buf[--i]);
    }
}

static void simple_append_dec(char **str, size_t *size, INT64 num) {
    char buf[21];
    int i = 0;
    int neg = 0;
    if (num < 0) {
        neg = 1;
        num = -num;
    }
    if (num == 0) {
        simple_append(str, size, '0');
        return;
    }
    while (num > 0) {
        buf[i++] = (num % 10) + '0';
        num /= 10;
    }
    if (neg) simple_append(str, size, '-');
    while (i > 0) {
        simple_append(str, size, buf[--i]);
    }
}

UINTN AsciiVSPrint(CHAR8 *StartOfBuffer, UINTN BufferSize, CONST CHAR8 *FormatString, VA_LIST Marker) {
    char *str = StartOfBuffer;
    size_t size = BufferSize;
    const char *fmt = FormatString;
    
    while (*fmt) {
        if (*fmt == '%') {
            fmt++;
            if (*fmt == 's') {
                char *s = VA_ARG(Marker, char*);
                simple_append_str(&str, &size, s ? s : "(null)");
            } else if (*fmt == 'd') {
                int d = VA_ARG(Marker, int);
                simple_append_dec(&str, &size, d);
            } else if (*fmt == 'x' || *fmt == 'X') {
                unsigned int x = VA_ARG(Marker, unsigned int);
                simple_append_hex(&str, &size, x);
            } else if (*fmt == 'p') {
                void *p = VA_ARG(Marker, void*);
                simple_append_hex(&str, &size, (UINT64)p);
            } else if (*fmt == '%') {
                simple_append(&str, &size, '%');
            } else {
                simple_append(&str, &size, '%');
                simple_append(&str, &size, *fmt);
            }
        } else {
            simple_append(&str, &size, *fmt);
        }
        fmt++;
    }
    *str = 0;
    return (UINTN)(str - StartOfBuffer);
}

UINTN AsciiSPrint(CHAR8 *StartOfBuffer, UINTN BufferSize, CONST CHAR8 *FormatString, ...) {
    VA_LIST Marker;
    VA_START(Marker, FormatString);
    UINTN ret = AsciiVSPrint(StartOfBuffer, BufferSize, FormatString, Marker);
    VA_END(Marker);
    return ret;
}

// Time functions
struct tm *gmtime(const time_t *timep) { return NULL; }
time_t mktime(struct tm *tm) { return 0; }
int sscanf(const char *str, const char *format, ...) { return 0; }

time_t time(time_t *tloc) { return 0; }
double difftime(time_t time1, time_t time0) { return (double)(time1 - time0); }
double cbrt(double x) { return 0; }
double log2(double x) { return 0; }
double trunc(double x) { return (double)(int)x; }


// Needed for CrtLibSupport headers to work?
// They use VA_LIST etc which are in Base.h
