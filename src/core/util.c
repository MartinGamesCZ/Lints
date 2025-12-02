#include "util.h"
#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdarg.h>
#include "stdio.h"
#include "quickjs.h"
#include "efi.h"


void halt() {
  for(;;);
}

//---------------------------------------------------------------
//
//  !!! AI GENERATE SLOP, PLEASE FIX !!!
//
//---------------------------------------------------------------

uint16_t *AsciiToUnicode(const char *ascii) {
  static uint16_t buffer[1024];

  int i;
  for (i = 0; ascii[i] && i < 1023; i++) {
    buffer[i] = (uint16_t)ascii[i];
  }

  buffer[i] = 0;

  return buffer;
}