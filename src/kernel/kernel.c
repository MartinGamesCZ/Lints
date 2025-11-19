#include <string.h>
#include <stdint.h>
#include <duktape.h>
#include "embedded_js.h"

#define WHITE_TXT 0x0F

// Forward declaration
unsigned int k_printf(char *message, unsigned int line);

duk_context *ctx;

duk_ret_t native_addrw(duk_context *ctx)
{
  // Get the address (first argument)
  uint32_t address = (uint32_t)duk_to_uint32(ctx, 0);

  // Get the value to write (second argument)
  uint8_t value = (uint8_t)duk_to_uint32(ctx, 1);

  // Write the value to the address
  uint8_t *ptr = (uint8_t *)address;
  *ptr = value;

  return 0;
}

void kmain()
{
  // Initialize Duktape heap
  ctx = duk_create_heap_default();

  // Register native memory write function
  duk_push_c_function(ctx, native_addrw, 2);
  duk_put_global_string(ctx, "$addrw");

  // Execute embedded JavaScript code from build/index.js
  duk_push_string(ctx, embedded_js_code);
  duk_int_t returnCode = duk_peval(ctx);

  if (returnCode != 0)
  {
    // Error occurred - display stack trace
    duk_safe_to_stacktrace(ctx, -1);
    k_printf((char *)duk_safe_to_string(ctx, -1), 1);
  }

  duk_pop(ctx);
}

unsigned int k_printf(char *message, unsigned int line)
{
  char *vidmem = (char *)0xb8000;
  unsigned int i = 0;

  i = (line * 80 * 2);

  while (*message != 0)
  {
    if (*message == '\n') // check for a new line
    {
      line++;
      i = (line * 80 * 2);
      *message++;
    }
    else
    {
      vidmem[i] = *message;
      *message++;
      i++;
      vidmem[i] = WHITE_TXT;
      i++;
    };
  };

  return (1);
}