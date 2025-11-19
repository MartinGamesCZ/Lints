import {
  kmod_graphics_vga_clear,
  kmod_graphics_vga_init,
  kmod_graphics_vga_pushLine,
} from "./modules/graphics/vga";

export function kmain() {
  kmod_graphics_vga_init();
  kmod_graphics_vga_pushLine("[Kernel] Kernel initialized successfully.");
}
