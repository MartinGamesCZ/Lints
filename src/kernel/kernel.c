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

// Port byte in
duk_ret_t native_ptin(duk_context *ctx)
{
  // Get the port (first argument)
  uint16_t port = (uint16_t)duk_to_uint32(ctx, 0);

  uint8_t result;
  __asm__ volatile("inb %1, %0"
                   : "=a"(result)
                   : "Nd"(port));

  duk_push_uint(ctx, (duk_uint_t)result);
  return 1;
}

// Port byte out
duk_ret_t native_ptout(duk_context *ctx)
{
  // Get the port (first argument)
  uint16_t port = (uint16_t)duk_to_uint32(ctx, 0);

  // Get the value to write (second argument)
  uint8_t value = (uint8_t)duk_to_uint32(ctx, 1);

  __asm__ volatile("outb %0, %1"
                   :
                   : "a"(value), "Nd"(port));

  return 0;
}

duk_ret_t native_dword_in(duk_context *ctx)
{
  // Get the port (first argument)
  uint16_t port = (uint16_t)duk_to_uint32(ctx, 0);

  uint32_t result;
  __asm__ volatile("inl %1, %0"
                   : "=a"(result)
                   : "Nd"(port));

  duk_push_uint(ctx, (duk_uint_t)result);
  return 1;
}

duk_ret_t native_dword_out(duk_context *ctx)
{
  // Get the port (first argument)
  uint16_t port = (uint16_t)duk_to_uint32(ctx, 0);

  // Get the value to write (second argument)
  uint32_t value = (uint32_t)duk_to_uint32(ctx, 1);

  __asm__ volatile("outl %0, %1"
                   :
                   : "a"(value), "Nd"(port));

  return 0;
}

void kmain()
{
  // Initialize Duktape heap
  ctx = duk_create_heap_default();

  // Register native memory write function
  duk_push_c_function(ctx, native_addrw, 2);
  duk_put_global_string(ctx, "$addrw");

  // Register native port in function
  duk_push_c_function(ctx, native_ptin, 1);
  duk_put_global_string(ctx, "$ptin");

  // Register native port out function
  duk_push_c_function(ctx, native_ptout, 2);
  duk_put_global_string(ctx, "$ptout");

  // Register native dword in function
  duk_push_c_function(ctx, native_dword_in, 1);
  duk_put_global_string(ctx, "$dwordin");

  // Register native dword out function
  duk_push_c_function(ctx, native_dword_out, 2);
  duk_put_global_string(ctx, "$dwordout");

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