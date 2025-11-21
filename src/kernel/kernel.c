#include <string.h>
#include <stdint.h>
#include <stdio.h>
#include <duktape.h>
#include "embedded_js.h"
#include "interrupt/isr.h"

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

duk_ret_t native_byte_in(duk_context *ctx)
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

duk_ret_t native_byte_out(duk_context *ctx)
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

duk_ret_t native_word_in(duk_context *ctx)
{
  uint16_t port = (uint16_t)duk_to_uint32(ctx, 0);

  uint16_t result;
  __asm__ volatile("inw %1, %0"
                   : "=a"(result)
                   : "Nd"(port));

  duk_push_uint(ctx, (duk_uint_t)result);
  return 1;
}

duk_ret_t native_word_out(duk_context *ctx)
{
  uint16_t port = (uint16_t)duk_to_uint32(ctx, 0);

  // Get the value to write (second argument)
  uint16_t value = (uint16_t)duk_to_uint32(ctx, 1);

  __asm__ volatile("outw %0, %1"
                   :
                   : "a"(value), "Nd"(port));

  return 0;
}

// Global context for IRQ handlers
duk_context *global_ctx = NULL;

// JavaScript IRQ wrapper
void js_irq_callback(registers_t *r)
{
  if (global_ctx == NULL)
    return;

  // Get IRQ number
  u8 irq_no = r->int_no - 32;

  // Build the key for this IRQ handler manually (avoid snprintf in interrupt)
  char key[32] = "irq_handler_";
  int key_len = 12;
  if (irq_no >= 10)
  {
    key[key_len++] = '0' + (irq_no / 10);
    key[key_len++] = '0' + (irq_no % 10);
  }
  else
  {
    key[key_len++] = '0' + irq_no;
  }
  key[key_len] = '\0';

  // Call the JavaScript handler
  duk_push_global_stash(global_ctx);

  if (duk_get_prop_string(global_ctx, -1, key))
  {
    // Function found, call it with IRQ number
    duk_push_uint(global_ctx, irq_no);

    // Try protected call with error handler
    duk_int_t rc = duk_pcall(global_ctx, 1);
    duk_pop(global_ctx); // Pop result or error
  }
  else
  {
    duk_pop(global_ctx); // Pop undefined value
  }

  duk_pop(global_ctx); // Pop stash
}

// Native function to register IRQ from JavaScript
duk_ret_t native_irq_register(duk_context *ctx)
{
  // Get the IRQ number
  u8 irq = (u8)duk_to_uint32(ctx, 0);

  // Get the handler function
  if (!duk_is_function(ctx, 1))
  {
    duk_push_boolean(ctx, 0);
    return 1;
  }

  // Store function in global stash
  char key[32];
  snprintf(key, sizeof(key), "irq_handler_%d", irq);

  duk_push_global_stash(ctx);
  duk_dup(ctx, 1); // Duplicate the function
  duk_put_prop_string(ctx, -2, key);
  duk_pop(ctx); // Pop stash

  // Register the C wrapper
  irq_register_handler(irq, js_irq_callback);

  duk_push_boolean(ctx, 1);
  return 1;
}

void kmain()
{
  // Initialize IDT and ISRs
  isr_install();
  irq_install();

  // Initialize Duktape heap
  ctx = duk_create_heap_default();
  global_ctx = ctx;

  // Register native memory write function
  duk_push_c_function(ctx, native_addrw, 2);
  duk_put_global_string(ctx, "$addrw");

  // Register native port in function
  duk_push_c_function(ctx, native_ptin, 1);
  duk_put_global_string(ctx, "$ptin");

  // Register native port out function
  duk_push_c_function(ctx, native_ptout, 2);
  duk_put_global_string(ctx, "$ptout");

  // Register native byte in function
  duk_push_c_function(ctx, native_byte_in, 1);
  duk_put_global_string(ctx, "$bytein");

  // Register native byte out function
  duk_push_c_function(ctx, native_byte_out, 2);
  duk_put_global_string(ctx, "$byteout");

  // Register native dword in function
  duk_push_c_function(ctx, native_dword_in, 1);
  duk_put_global_string(ctx, "$dwordin");

  // Register native dword out function
  duk_push_c_function(ctx, native_dword_out, 2);
  duk_put_global_string(ctx, "$dwordout");

  // Register native dword in function
  duk_push_c_function(ctx, native_word_in, 1);
  duk_put_global_string(ctx, "$wordin");

  // Register native dword out function
  duk_push_c_function(ctx, native_word_out, 2);
  duk_put_global_string(ctx, "$wordout");

  // Register native IRQ registration function
  duk_push_c_function(ctx, native_irq_register, 2);
  duk_put_global_string(ctx, "$irqregister");

  // Enable interrupts before JavaScript execution
  __asm__ volatile("sti");

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