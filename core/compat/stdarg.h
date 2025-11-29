#ifndef COMPAT_STDARG_H
#define COMPAT_STDARG_H

#ifndef MDE_CPU_X64
#define MDE_CPU_X64
#endif
#include <Base.h>
#include_next <stdarg.h>

#ifndef va_copy
#define va_copy(dest, src) VA_COPY(dest, src)
#endif

#endif
