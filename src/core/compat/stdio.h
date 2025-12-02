//---------------------------------------------------------------
//
//  !!! AI GENERATE SLOP, PLEASE FIX !!!
//
//---------------------------------------------------------------

#pragma once
#include <stdarg.h>
#include <stddef.h>

typedef struct FILE FILE;

#define stdout ((FILE*)1)
#define stderr ((FILE*)2)
#define stdin  ((FILE*)0)

int printf(const char *format, ...);
int fprintf(FILE *stream, const char *format, ...);
int snprintf(char *str, size_t size, const char *format, ...);
int vsnprintf(char *str, size_t size, const char *format, va_list ap);
int fputc(int c, FILE *stream);
int putchar(int c);
size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream);
