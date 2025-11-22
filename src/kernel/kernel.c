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

// Proxy getter for __oskrnl that forwards to root context's globalThis.__oskrnl
duk_ret_t oskrnl_proxy_getter(duk_context *isolated_ctx)
{
  // Get the property name being accessed
  const char *prop_name = duk_require_string(isolated_ctx, 1);

  // Get the root context from the hidden symbol in the isolated context
  duk_push_global_stash(isolated_ctx);
  duk_get_prop_string(isolated_ctx, -1, "\xFF"
                                        "root_ctx_ptr");
  duk_context *root_ctx = (duk_context *)duk_get_pointer(isolated_ctx, -1);
  duk_pop_2(isolated_ctx);

  if (root_ctx == NULL)
  {
    duk_push_undefined(isolated_ctx);
    return 1;
  }

  // Access globalThis.__oskrnl[prop_name] in the root context
  duk_push_global_object(root_ctx);
  duk_get_prop_string(root_ctx, -1, "__oskrnl");

  if (!duk_is_object(root_ctx, -1))
  {
    duk_pop_2(root_ctx);
    duk_push_undefined(isolated_ctx);
    return 1;
  }

  duk_get_prop_string(root_ctx, -1, prop_name);

  // If it's a function, we need to create a wrapper that calls it in root context
  if (duk_is_function(root_ctx, -1))
  {
    // Store the function reference in root context's stash
    char stash_key[128];
    snprintf(stash_key, sizeof(stash_key), "\xFF"
                                           "oskrnl_fn_%s",
             prop_name);

    duk_push_global_stash(root_ctx);
    duk_dup(root_ctx, -2); // Duplicate the function
    duk_put_prop_string(root_ctx, -2, stash_key);
    duk_pop(root_ctx); // Pop stash

    duk_pop_3(root_ctx); // Pop function, __oskrnl, globalThis

    // Create a wrapper function in the isolated context
    // Use ES5 syntax compatible with Duktape
    const char *wrapper_code =
        "(function(propName) {"
        "  return function() {"
        "    var args = Array.prototype.slice.call(arguments);"
        "    return __oskrnl_call_native(propName, args);"
        "  };"
        "})";

    duk_push_string(isolated_ctx, wrapper_code);
    if (duk_peval(isolated_ctx) != 0)
    {
      duk_pop(isolated_ctx);
      duk_push_undefined(isolated_ctx);
      return 1;
    }

    duk_push_string(isolated_ctx, prop_name);
    if (duk_pcall(isolated_ctx, 1) != 0)
    {
      duk_pop(isolated_ctx);
      duk_push_undefined(isolated_ctx);
      return 1;
    }

    return 1;
  }

  // For non-function properties, just get the value (primitives)
  if (duk_is_number(root_ctx, -1))
  {
    double val = duk_get_number(root_ctx, -1);
    duk_pop_3(root_ctx);
    duk_push_number(isolated_ctx, val);
    return 1;
  }
  else if (duk_is_string(root_ctx, -1))
  {
    const char *val = duk_get_string(root_ctx, -1);
    duk_pop_3(root_ctx);
    duk_push_string(isolated_ctx, val);
    return 1;
  }
  else if (duk_is_boolean(root_ctx, -1))
  {
    int val = duk_get_boolean(root_ctx, -1);
    duk_pop_3(root_ctx);
    duk_push_boolean(isolated_ctx, val);
    return 1;
  }

  duk_pop_3(root_ctx);
  duk_push_undefined(isolated_ctx);
  return 1;
}

// Callback bridge to call from root context back to isolated context
duk_ret_t native_bridge_callback(duk_context *root_ctx)
{
  // Get metadata from the current function (the bridge)
  duk_push_current_function(root_ctx);

  duk_get_prop_string(root_ctx, -1, "\xFF"
                                    "isolated_ctx_ptr");
  duk_context *isolated_ctx = (duk_context *)duk_get_pointer(root_ctx, -1);
  duk_pop(root_ctx);

  duk_get_prop_string(root_ctx, -1, "\xFF"
                                    "fn_id");
  const char *fn_id = duk_get_string(root_ctx, -1);
  duk_pop(root_ctx);

  duk_pop(root_ctx); // Pop current function

  if (isolated_ctx == NULL || fn_id == NULL)
  {
    return 0;
  }

  // Get the target function from isolated context stash
  duk_push_global_stash(isolated_ctx);
  duk_get_prop_string(isolated_ctx, -1, fn_id);
  duk_remove(isolated_ctx, -2); // Remove stash

  if (!duk_is_function(isolated_ctx, -1))
  {
    duk_pop(isolated_ctx);
    return 0;
  }

  // Marshal arguments from root to isolated
  duk_idx_t nargs = duk_get_top(root_ctx);
  for (duk_idx_t i = 0; i < nargs; i++)
  {
    if (duk_is_number(root_ctx, i))
    {
      duk_push_number(isolated_ctx, duk_get_number(root_ctx, i));
    }
    else if (duk_is_string(root_ctx, i))
    {
      duk_push_string(isolated_ctx, duk_get_string(root_ctx, i));
    }
    else if (duk_is_boolean(root_ctx, i))
    {
      duk_push_boolean(isolated_ctx, duk_get_boolean(root_ctx, i));
    }
    else
    {
      duk_push_undefined(isolated_ctx);
    }
  }

  // Call the isolated function
  if (duk_pcall(isolated_ctx, nargs) != 0)
  {
    // Error occurred
    const char *err = duk_safe_to_string(isolated_ctx, -1);
    // k_printf((char *)"[Bridge] Error: ", 24);
    // k_printf((char *)err, 25);
    duk_pop(isolated_ctx); // Pop error
    return 0;
  }

  // Marshal return value back to root
  if (duk_is_number(isolated_ctx, -1))
  {
    duk_push_number(root_ctx, duk_get_number(isolated_ctx, -1));
  }
  else if (duk_is_string(isolated_ctx, -1))
  {
    duk_push_string(root_ctx, duk_get_string(isolated_ctx, -1));
  }
  else if (duk_is_boolean(isolated_ctx, -1))
  {
    duk_push_boolean(root_ctx, duk_get_boolean(isolated_ctx, -1));
  }
  else
  {
    duk_push_undefined(root_ctx);
  }

  duk_pop(isolated_ctx); // Pop result

  return 1;
}

// Native helper to call root context oskrnl functions
duk_ret_t oskrnl_call_native(duk_context *isolated_ctx)
{
  // Get function name and arguments
  const char *fn_name = duk_require_string(isolated_ctx, 0);

  if (!duk_is_array(isolated_ctx, 1))
  {
    duk_push_undefined(isolated_ctx);
    return 1;
  }

  // Get the root context
  duk_push_global_stash(isolated_ctx);
  duk_get_prop_string(isolated_ctx, -1, "\xFF"
                                        "root_ctx_ptr");
  duk_context *root_ctx = (duk_context *)duk_get_pointer(isolated_ctx, -1);
  duk_pop_2(isolated_ctx);

  if (root_ctx == NULL)
  {
    duk_push_undefined(isolated_ctx);
    return 1;
  }

  // Get the function from root context stash
  char stash_key[128];
  snprintf(stash_key, sizeof(stash_key), "\xFF"
                                         "oskrnl_fn_%s",
           fn_name);

  duk_push_global_stash(root_ctx);
  duk_get_prop_string(root_ctx, -1, stash_key);

  if (!duk_is_function(root_ctx, -1))
  {
    duk_pop_2(root_ctx);
    duk_push_undefined(isolated_ctx);
    return 1;
  }

  // Transfer arguments from isolated context to root context
  duk_size_t arg_count = duk_get_length(isolated_ctx, 1);

  for (duk_size_t i = 0; i < arg_count; i++)
  {
    duk_get_prop_index(isolated_ctx, 1, i);

    if (duk_is_number(isolated_ctx, -1))
    {
      duk_push_number(root_ctx, duk_get_number(isolated_ctx, -1));
    }
    else if (duk_is_string(isolated_ctx, -1))
    {
      duk_push_string(root_ctx, duk_get_string(isolated_ctx, -1));
    }
    else if (duk_is_boolean(isolated_ctx, -1))
    {
      duk_push_boolean(root_ctx, duk_get_boolean(isolated_ctx, -1));
    }
    else if (duk_is_function(isolated_ctx, -1))
    {
      // Create a bridge function in root context
      static int bridge_cnt = 0;
      char bridge_id[32];
      snprintf(bridge_id, sizeof(bridge_id), "b_%d", bridge_cnt++);

      // Stash isolated function
      duk_push_global_stash(isolated_ctx);
      duk_dup(isolated_ctx, -2);
      duk_put_prop_string(isolated_ctx, -2, bridge_id);
      duk_pop(isolated_ctx);

      // Create bridge in root
      duk_push_c_function(root_ctx, native_bridge_callback, DUK_VARARGS);

      // Attach metadata
      duk_push_pointer(root_ctx, isolated_ctx);
      duk_put_prop_string(root_ctx, -2, "\xFF"
                                        "isolated_ctx_ptr");

      duk_push_string(root_ctx, bridge_id);
      duk_put_prop_string(root_ctx, -2, "\xFF"
                                        "fn_id");
    }
    else
    {
      duk_push_undefined(root_ctx);
    }

    duk_pop(isolated_ctx);
  }

  // Call the function in root context
  duk_int_t rc = duk_pcall(root_ctx, arg_count);

  // Transfer return value back to isolated context
  if (rc == 0)
  {
    if (duk_is_number(root_ctx, -1))
    {
      duk_push_number(isolated_ctx, duk_get_number(root_ctx, -1));
    }
    else if (duk_is_string(root_ctx, -1))
    {
      duk_push_string(isolated_ctx, duk_get_string(root_ctx, -1));
    }
    else if (duk_is_boolean(root_ctx, -1))
    {
      duk_push_boolean(isolated_ctx, duk_get_boolean(root_ctx, -1));
    }
    else
    {
      duk_push_undefined(isolated_ctx);
    }
    duk_pop(root_ctx); // Pop result
  }
  else
  {
    duk_pop(root_ctx); // Pop error
    duk_push_undefined(isolated_ctx);
  }

  duk_pop(root_ctx); // Pop stash

  return 1;
}

// Native function to execute JS code in isolated context with __oskrnl access
duk_ret_t native_isolated_exec(duk_context *ctx)
{
  // Get the JS code to execute
  const char *js_code = duk_require_string(ctx, 0);

  // Create a new isolated Duktape heap
  duk_context *isolated_ctx = duk_create_heap_default();

  if (isolated_ctx == NULL)
  {
    duk_push_boolean(ctx, 0);
    return 1;
  }

  // Store reference to root context in isolated context's stash
  duk_push_global_stash(isolated_ctx);
  duk_push_pointer(isolated_ctx, ctx);
  duk_put_prop_string(isolated_ctx, -2, "\xFF"
                                        "root_ctx_ptr");
  duk_pop(isolated_ctx);

  // Register the native call helper in isolated context
  duk_push_c_function(isolated_ctx, oskrnl_call_native, 2);
  duk_put_global_string(isolated_ctx, "__oskrnl_call_native");

  // Register the getter function
  duk_push_c_function(isolated_ctx, oskrnl_proxy_getter, 2);
  duk_put_global_string(isolated_ctx, "__oskrnl_get_prop");

  // Create __oskrnl proxy object using ES6 Proxy
  const char *proxy_code =
      "(function() {"
      "  var handler = {"
      "    get: function(target, prop) {"
      "      if (typeof prop === 'symbol') return undefined;"
      "      return __oskrnl_get_prop(null, String(prop));"
      "    }"
      "  };"
      "  return new Proxy({}, handler);"
      "})()";

  duk_push_string(isolated_ctx, proxy_code);

  if (duk_peval(isolated_ctx) != 0)
  {
    duk_pop(isolated_ctx);
    duk_destroy_heap(isolated_ctx);
    duk_push_boolean(ctx, 0);
    return 1;
  }

  duk_put_global_string(isolated_ctx, "__oskrnl");

  // Execute the provided JS code
  duk_push_string(isolated_ctx, js_code);
  duk_int_t rc = duk_peval(isolated_ctx);

  // Check for errors
  int success = (rc == 0);

  if (!success)
  {
    // Transfer error message back to root context for display
    const char *err = duk_safe_to_string(isolated_ctx, -1);
    k_printf((char *)"[Isolated] Execution error: ", 12);
    k_printf((char *)err, 13);
  }

  duk_pop(isolated_ctx); // Pop result or error

  // Clean up the isolated heap
  // duk_destroy_heap(isolated_ctx);

  // Return success/failure
  duk_push_boolean(ctx, success);
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

  // Register native isolated execution function
  duk_push_c_function(ctx, native_isolated_exec, 1);
  duk_put_global_string(ctx, "$isolatedExec");

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