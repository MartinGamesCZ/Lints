#include "main.h" 
#include "efi.h" 

void halt() {
  for (;;) {}
}

int kernel_main(EfiSystemTable* systemTable) {
  systemTable->conOut->clear_screen(systemTable->conOut);
  systemTable->conOut->output_string(systemTable->conOut, L"Hello, World!\n");

  halt();

  return 0;
}
