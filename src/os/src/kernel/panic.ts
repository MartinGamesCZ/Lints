import {
  kmod_graphics_vga_clear,
  kmod_graphics_vga_writeChar,
} from "./modules/graphics/vga";

export function kpanic(reason?: string) {
  kmod_graphics_vga_clear();

  const l1 = "KERNEL PANIC!";
  let l2 = "Unknown: Kernel crashed.";

  if (reason) l2 = "Reason: " + reason;

  for (let i = 0; i < l1.length; i++) {
    kmod_graphics_vga_writeChar(i, 0, l1[i]!, 0x0c);
  }

  for (let i = 0; i < l2.length; i++) {
    kmod_graphics_vga_writeChar(i, 1, l2[i]!, 0x0c);
  }
}
