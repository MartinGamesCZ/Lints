//---------------------------------------------------------------
//
//  !!! AI GENERATE SLOP, PLEASE FIX !!!
//
//---------------------------------------------------------------

#pragma once
#include <stddef.h>

void *malloc(size_t size);
void free(void *ptr);
void *realloc(void *ptr, size_t size);
void *calloc(size_t nmemb, size_t size);
double strtod(const char *str, char **endptr);
long strtol(const char *str, char **endptr, int base);
void abort(void);
#define alloca __builtin_alloca
void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));
int abs(int j);
size_t _msize(void *ptr);
