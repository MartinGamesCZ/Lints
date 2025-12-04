#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdarg.h>
#include "stdio.h"

#ifndef UTIL_H
#define UTIL_H

void halt();
uint16_t *AsciiToUnicode(const char *ascii);

#endif