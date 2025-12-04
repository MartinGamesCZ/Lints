//---------------------------------------------------------------
//
//  !!! AI GENERATE SLOP, PLEASE FIX !!!
//
//---------------------------------------------------------------

#include <stdarg.h>
#include <stddef.h>
#include <stdint.h>

extern int printf(const char *format, ...);

// Basic libc stub implementations for Elk

// String functions
void *memset(void *s, int c, size_t n) {
    unsigned char *p = s;
    while (n--) *p++ = (unsigned char)c;
    return s;
}

void *memcpy(void *dest, const void *src, size_t n) {
    unsigned char *d = dest;
    const unsigned char *s = src;
    while (n--) *d++ = *s++;
    return dest;
}

void *memmove(void *dest, const void *src, size_t n) {
    unsigned char *d = dest;
    const unsigned char *s = src;
    if (d < s) {
        while (n--) *d++ = *s++;
    } else {
        d += n;
        s += n;
        while (n--) *--d = *--s;
    }
    return dest;
}

int memcmp(const void *s1, const void *s2, size_t n) {
    const unsigned char *p1 = s1, *p2 = s2;
    while (n--) {
        if (*p1 != *p2) return *p1 - *p2;
        p1++;
        p2++;
    }
    return 0;
}

size_t strlen(const char *s) {
    size_t len = 0;
    while (s[len]) len++;
    return len;
}

int strcmp(const char *s1, const char *s2) {
    while (*s1 && (*s1 == *s2)) {
        s1++;
        s2++;
    }
    return *(unsigned char *)s1 - *(unsigned char *)s2;
}

int strncmp(const char *s1, const char *s2, size_t n) {
    while (n && *s1 && (*s1 == *s2)) {
        s1++;
        s2++;
        n--;
    }
    if (n == 0) return 0;
    return *(unsigned char *)s1 - *(unsigned char *)s2;
}

char *strcpy(char *dest, const char *src) {
    char *d = dest;
    while ((*d++ = *src++));
    return dest;
}

char *strncpy(char *dest, const char *src, size_t n) {
    size_t i;
    for (i = 0; i < n && src[i]; i++)
        dest[i] = src[i];
    for (; i < n; i++)
        dest[i] = '\0';
    return dest;
}

// Math functions - basic implementations
double floor(double x) {
    if (x >= 0) {
        return (double)(int64_t)x;
    } else {
        int64_t i = (int64_t)x;
        return (i == x) ? x : (double)(i - 1);
    }
}

double ceil(double x) {
    if (x >= 0) {
        int64_t i = (int64_t)x;
        return (i == x) ? x : (double)(i + 1);
    } else {
        return (double)(int64_t)x;
    }
}

double fabs(double x) {
    return x < 0 ? -x : x;
}

double modf(double x, double *iptr) {
    *iptr = (double)(int64_t)x;
    return x - *iptr;
}

double fmod(double x, double y) {
    if (y == 0.0) return 0.0;
    return x - floor(x / y) * y;
}

// Simple sqrt using Newton's method
double sqrt(double x) {
    if (x < 0) return 0.0;
    if (x == 0) return 0.0;
    
    double guess = x / 2.0;
    double prev;
    int iterations = 10;
    
    while (iterations--) {
        prev = guess;
        guess = (guess + x / guess) / 2.0;
        if (fabs(guess - prev) < 0.0001) break;
    }
    return guess;
}

double pow(double x, double y) {
    // Very basic pow - only handles integer exponents
    if (y == 0.0) return 1.0;
    if (y < 0.0) return 1.0 / pow(x, -y);
    
    double result = 1.0;
    int64_t exp = (int64_t)y;
    while (exp--) result *= x;
    return result;
}

double log(double x) {
    // Simplified log (not accurate, just enough for Elk)
    if (x <= 0) return 0.0;
    return 0.0;  // Stub
}

double exp(double x) {
    // Simplified exp  
    (void)x;
    return 1.0;  // Stub
}

double sin(double x) {
    (void)x;
    return 0.0;  // Stub
}

double cos(double x) {
    (void)x;
    return 1.0;  // Stub  
}

double tan(double x) {
    (void)x;
    return 0.0;  // Stub
}

int isnan(double x) {
    return x != x;
}

int isinf(double x) {
    return x == __builtin_inf() || x == -__builtin_inf();
}

int isfinite(double x) {
    return !isnan(x) && !isinf(x);
}

// Stdlib functions
double strtod(const char *str, char **endptr) {
    double result = 0.0;
    double sign = 1.0;
    double scale = 0.1;
    int decimal = 0;
    
    while (*str == ' ' || *str == '\t') str++;
    
    if (*str == '-') {
        sign = -1.0;
        str++;
    } else if (*str == '+') {
        str++;
    }
    
    while (*str) {
        if (*str >= '0' && *str <= '9') {
            if (decimal) {
                result += (*str - '0') * scale;
                scale *= 0.1;
            } else {
                result = result * 10.0 + (*str - '0');
            }
        } else if (*str == '.' && !decimal) {
            decimal = 1;
        } else {
            break;
        }
        str++;
    }
    
    if (endptr) *endptr = (char *)str;
    return result * sign;
}

long strtol(const char *str, char **endptr, int base) {
    long result = 0;
    int sign = 1;
    
    while (*str == ' ') str++;
    
    if (*str == '-') {
        sign = -1;
        str++;
    }
    
    while (*str >= '0' && *str <= '9') {
        result = result * base + (*str - '0');
        str++;
    }
    
    if (endptr) *endptr = (char *)str;
    return result * sign;
}

// Dynamic heap - will be initialized based on available RAM
static unsigned char *heap = NULL;
static size_t heap_size = 0;
static size_t heap_pos = 0;

// Forward declare EFI types we need
typedef uint64_t EFI_STATUS;
typedef void* EFI_HANDLE;
typedef uint64_t UINT64;
typedef uint32_t UINT32;
typedef uintptr_t UINTN;

typedef struct {
    UINT32 Type;
    UINT64 PhysicalStart;
    UINT64 VirtualStart;
    UINT64 NumberOfPages;
    UINT64 Attribute;
} EFI_MEMORY_DESCRIPTOR;

typedef struct EFI_BOOT_SERVICES_PARTIAL {
    // EFI_TABLE_HEADER (24 bytes) + 5 pointers (RaiseTPL, RestoreTPL, AllocatePages, FreePages, GetMemoryMap)
    char padding[64]; // 24 + 5*8 = 64 bytes to reach AllocatePool
    EFI_STATUS (*AllocatePool)(UINT32 PoolType, UINTN Size, void **Buffer);
} EFI_BOOT_SERVICES_PARTIAL;

typedef struct {
    char hdr[24]; // EFI_TABLE_HEADER
    void *firmwareVendor;
    UINT32 firmwareRevision;
    void *consoleInHandle;
    void *conIn;
    void *consoleOutHandle;
    void *ConOut;
    void *standardErrorHandle;
    void *stdErr;
    void *runtimeServices;
    EFI_BOOT_SERVICES_PARTIAL *BootServices;
} EFI_SYSTEM_TABLE_PARTIAL;

#define EfiConventionalMemory 7

// Initialize heap with maximum available memory
void init_heap(void *system_table) {
    // Static fallback heap in case EFI allocation fails
    static unsigned char static_heap[64 * 1024 * 1024]; // 64 MB fallback
    
    EFI_SYSTEM_TABLE_PARTIAL *st = (EFI_SYSTEM_TABLE_PARTIAL*)system_table;
    
    // Safety check
    if (!st || !st->BootServices || !st->BootServices->AllocatePool) {
        printf("WARNING: EFI Boot Services not available, using static heap\n");
        heap = static_heap;
        heap_size = sizeof(static_heap);
        heap_pos = 0;
        printf("Heap initialized: %zu MB (static fallback)\n", heap_size / (1024 * 1024));
        return;
    }
    
    // Try to allocate a very large heap - start with 16 GB and work down if needed
    size_t sizes[] = {
        16ULL * 1024 * 1024 * 1024,  // 16 GB
        8ULL * 1024 * 1024 * 1024,   // 8 GB
        4ULL * 1024 * 1024 * 1024,   // 4 GB
        2ULL * 1024 * 1024 * 1024,   // 2 GB
        1ULL * 1024 * 1024 * 1024,   // 1 GB
        512ULL * 1024 * 1024,        // 512 MB
        256ULL * 1024 * 1024,        // 256 MB
        128ULL * 1024 * 1024,        // 128 MB
        64ULL * 1024 * 1024,         // 64 MB
        32ULL * 1024 * 1024,         // 32 MB
        16ULL * 1024 * 1024,         // 16 MB
        8ULL * 1024 * 1024           // 8 MB (fallback)
    };
    
    for (int i = 0; i < 12; i++) {
        EFI_STATUS status = st->BootServices->AllocatePool(
            EfiConventionalMemory,
            sizes[i],
            (void**)&heap
        );
        
        if (status == 0) { // EFI_SUCCESS
            heap_size = sizes[i];
            heap_pos = 0;
            if (heap_size >= 1024ULL * 1024 * 1024) {
                printf("Heap initialized: %zu GB (%zu bytes)\n", 
                       heap_size / (1024ULL * 1024 * 1024), heap_size);
            } else {
                printf("Heap initialized: %zu MB (%zu bytes)\n", 
                       heap_size / (1024 * 1024), heap_size);
            }
            return;
        }
    }
    
    // If all EFI allocations failed, use static heap
    printf("WARNING: EFI allocation failed, using static heap\n");
    heap = static_heap;
    heap_size = sizeof(static_heap);
    heap_pos = 0;
    printf("Heap initialized: %zu MB (static fallback)\n", heap_size / (1024 * 1024));
}

void *malloc(size_t size) {
    if (!heap) {
        printf("malloc failed: heap not initialized\n");
        return (void*)0;
    }
    size = (size + 7) & ~7;
    size_t total = size + 8;
    if (heap_pos + total > heap_size) {
        printf("malloc failed: OOM (requested %zu, available %zu)\n", total, heap_size - heap_pos);
        return (void*)0;
    }
    *(size_t*)&heap[heap_pos] = size;
    void *ptr = &heap[heap_pos + 8];
    heap_pos += total;
    return ptr;
}

void free(void *ptr) {
    (void)ptr;
}

void *realloc(void *ptr, size_t size) {
    if (!ptr) return malloc(size);
    size_t *p_size = (size_t*)((char*)ptr - 8);
    size_t old_size = *p_size;
    if (size <= old_size) return ptr;
    
    void *new_ptr = malloc(size);
    if (!new_ptr) return (void*)0;
    memcpy(new_ptr, ptr, old_size);
    return new_ptr;
}

void *calloc(size_t nmemb, size_t size) {
    size_t total = nmemb * size;
    void *ptr = malloc(total);
    if (ptr) memset(ptr, 0, total);
    return ptr;
}



void abort(void) {
    printf("ABORT called!\n");
    while(1);
}

// stdio functions
int vsnprintf(char *str, size_t size, const char *format, __builtin_va_list ap) {
    size_t i = 0;
    const char *p = format;
    
    while (*p && i < size - 1) {
        if (*p != '%') {
            str[i++] = *p++;
            continue;
        }
        
        p++; // Skip '%'
        
        // Parse flags, width, precision, length modifiers
        int precision = -1;
        
        // Flags (ignored for now)
        while (*p == '-' || *p == '+' || *p == ' ' || *p == '#' || *p == '0') p++;
        
        // Width
        if (*p == '*') {
            __builtin_va_arg(ap, int); // Consume width
            p++;
        } else {
            while (*p >= '0' && *p <= '9') p++;
        }
        
        // Precision
        if (*p == '.') {
            p++;
            if (*p == '*') {
                precision = __builtin_va_arg(ap, int);
                p++;
            } else {
                int val = 0;
                while (*p >= '0' && *p <= '9') {
                    val = val * 10 + (*p - '0');
                    p++;
                }
                precision = val;
            }
        }
        
        // Length modifiers (ignored)
        while (*p == 'h' || *p == 'l' || *p == 'L' || *p == 'z' || *p == 't') p++;
        
        if (*p == 'd' || *p == 'i') {
            int val = __builtin_va_arg(ap, int);
            char buf[32];
            int pos = 0;
            int neg = 0;
            if (val < 0) { neg = 1; val = -val; }
            if (val == 0) buf[pos++] = '0';
            while (val) {
                buf[pos++] = '0' + (val % 10);
                val /= 10;
            }
            if (neg) buf[pos++] = '-';
            while (pos > 0 && i < size - 1) str[i++] = buf[--pos];
        } else if (*p == 'u') {
            unsigned int val = __builtin_va_arg(ap, unsigned int);
            char buf[32];
            int pos = 0;
            if (val == 0) buf[pos++] = '0';
            while (val) {
                buf[pos++] = '0' + (val % 10);
                val /= 10;
            }
            while (pos > 0 && i < size - 1) str[i++] = buf[--pos];
        } else if (*p == 's') {
            const char *s = __builtin_va_arg(ap, const char *);
            if (!s) s = "(null)";
            
            size_t len = 0;
            const char *tmp = s;
            while (*tmp++) len++;
            
            if (precision >= 0 && len > (size_t)precision) len = (size_t)precision;
            
            size_t k = 0;
            while (k < len && i < size - 1) str[i++] = s[k++];
        } else if (*p == 'c') {
            char c = (char)__builtin_va_arg(ap, int);
            if (i < size - 1) str[i++] = c;
        } else if (*p == 'g' || *p == 'f') {
            // Basic double support
            double val = __builtin_va_arg(ap, double);
            int ival = (int)val;
            
            // Print integer part
            char buf[32];
            int pos = 0;
            int neg = 0;
            if (val < 0) { neg = 1; val = -val; ival = -ival; }
            
            if (ival == 0) buf[pos++] = '0';
            int temp = ival;
            while (temp) {
                buf[pos++] = '0' + (temp % 10);
                temp /= 10;
            }
            if (neg) buf[pos++] = '-';
            while (pos > 0 && i < size - 1) str[i++] = buf[--pos];
            
            // Simple decimal part (up to 4 digits)
            val -= (int)val;
            if (val > 0.0001) {
                if (i < size - 1) str[i++] = '.';
                for (int k=0; k<4 && val > 0.0001 && i < size-1; k++) {
                    val *= 10;
                    int digit = (int)val;
                    str[i++] = '0' + digit;
                    val -= digit;
                }
            }
        } else {
            if (i < size - 1) str[i++] = *p;
        }
        p++;
    }
    
    str[i] = '\0';
    return i;
}

int snprintf(char *str, size_t size, const char *format, ...) {
    __builtin_va_list ap;
    __builtin_va_start(ap, format);
    int ret = vsnprintf(str, size, format, ap);
    __builtin_va_end(ap);
    return ret;
}



// Compiler intrinsics for Windows target
void __chkstk(void) {
    // Stack checking - not needed for UEFI
}

int _fltused = 0;  // Floating point used marker

char *strchr(const char *s, int c) {
    while (*s != (char)c) {
        if (!*s++) {
            return (void*)0;
        }
    }
    return (char *)s;
}





double trunc(double x) {
    return (x > 0) ? floor(x) : ceil(x);
}

double fmin(double x, double y) {
    return (x < y) ? x : y;
}

double fmax(double x, double y) {
    return (x > y) ? x : y;
}

double hypot(double x, double y) {
    return sqrt(x*x + y*y);
}

double acos(double x) { (void)x; return 0.0; }
double asin(double x) { (void)x; return 0.0; }
double atan(double x) { (void)x; return 0.0; }
double atan2(double y, double x) { (void)y; (void)x; return 0.0; }
double cbrt(double x) { (void)x; return 0.0; }
double cosh(double x) { (void)x; return 0.0; }
double expm1(double x) { (void)x; return 0.0; }
double log1p(double x) { (void)x; return 0.0; }
double log2(double x) { (void)x; return 0.0; }
double log10(double x) { (void)x; return 0.0; }
double sinh(double x) { (void)x; return 0.0; }
double tanh(double x) { (void)x; return 0.0; }
double asinh(double x) { (void)x; return 0.0; }
double acosh(double x) { (void)x; return 0.0; }
double atanh(double x) { (void)x; return 0.0; }

double round(double x) {
    return (x >= 0.0) ? floor(x + 0.5) : ceil(x - 0.5);
}

long int lrint(double x) {
    return (long int)round(x);
}



size_t _msize(void *ptr) {
    if (!ptr) return 0;
    return *(size_t*)((char*)ptr - 8);
}

int fesetround(int round) { (void)round; return 0; }
int fegetround(void) { return 0; }

int errno = 0;

#include "time.h"
#include "sys/time.h"

time_t time(time_t *t) {
    if (t) *t = 0;
    return 0;
}

static struct tm tm_buf;

struct tm *gmtime(const time_t *timep) {
    (void)timep;
    // Stub: return 1970-01-01
    tm_buf.tm_year = 70;
    tm_buf.tm_mon = 0;
    tm_buf.tm_mday = 1;
    return &tm_buf;
}

struct tm *localtime(const time_t *timep) {
    return gmtime(timep);
}

time_t mktime(struct tm *tm) {
    (void)tm;
    return 0;
}


int gettimeofday(struct timeval *tv, struct timezone *tz) {
    if (tv) {
        tv->tv_sec = 0;
        tv->tv_usec = 0;
    }
    return 0;
}

void *memchr(const void *s, int c, size_t n) {
    const unsigned char *p = s;
    while (n--) {
        if (*p == (unsigned char)c) return (void *)p;
        p++;
    }
    return (void*)0;
}

char *strcat(char *dest, const char *src) {
    char *d = dest;
    while (*d) d++;
    while ((*d++ = *src++));
    return dest;
}

char *strncat(char *dest, const char *src, size_t n) {
    char *d = dest;
    while (*d) d++;
    while (n-- && *src) *d++ = *src++;
    *d = 0;
    return dest;
}

char *strstr(const char *haystack, const char *needle) {
    size_t len = strlen(needle);
    if (len == 0) return (char *)haystack;
    while (*haystack) {
        if (!memcmp(haystack, needle, len)) return (char *)haystack;
        haystack++;
    }
    return (void*)0;
}

char *strdup(const char *s) {
    size_t len = strlen(s) + 1;
    char *new = malloc(len);
    if (new) memcpy(new, s, len);
    return new;
}

char *strrchr(const char *s, int c) {
    const char *found = (void*)0;
    while (*s) {
        if (*s == (char)c) found = s;
        s++;
    }
    if (*s == (char)c) found = s;
    return (char *)found;
}


int abs(int j) {
    return (j < 0) ? -j : j;
}

int isdigit(int c) {
    return (c >= '0' && c <= '9');
}

int isspace(int c) {
    return (c == ' ' || c == '\t' || c == '\n' || c == '\v' || c == '\f' || c == '\r');
}

int isupper(int c) {
    return (c >= 'A' && c <= 'Z');
}

int islower(int c) {
    return (c >= 'a' && c <= 'z');
}

int isalpha(int c) {
    return isupper(c) || islower(c);
}

int isalnum(int c) {
    return isalpha(c) || isdigit(c);
}

int tolower(int c) {
    return isupper(c) ? c + 32 : c;
}

int toupper(int c) {
    return islower(c) ? c - 32 : c;
}

void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *)) {
    // Simple bubble sort for now
    if (nmemb < 2 || size == 0) return;
    char *b = (char *)base;
    
    // Byte-by-byte swap to avoid malloc
    for (size_t i = 0; i < nmemb - 1; i++) {
        for (size_t j = 0; j < nmemb - i - 1; j++) {
            if (compar(b + j * size, b + (j + 1) * size) > 0) {
                char *p1 = b + j * size;
                char *p2 = b + (j + 1) * size;
                for (size_t k = 0; k < size; k++) {
                    char t = p1[k];
                    p1[k] = p2[k];
                    p2[k] = t;
                }
            }
        }
    }
}

#include "setjmp.h"

int setjmp(jmp_buf env) {
    (void)env;
    return 0;
}

void longjmp(jmp_buf env, int val) {
    (void)env; (void)val;
    printf("longjmp called!\n");
    abort();
}






