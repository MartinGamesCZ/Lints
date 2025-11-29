#ifndef COMPAT_STDIO_H
#define COMPAT_STDIO_H

#ifndef MDE_CPU_X64
#define MDE_CPU_X64
#endif
#include <Base.h>
#include_next <stdio.h>
#include <stdarg.h>

int vsnprintf(char *str, size_t size, const char *format, va_list ap);
int snprintf(char *str, size_t size, const char *format, ...);

#endif
