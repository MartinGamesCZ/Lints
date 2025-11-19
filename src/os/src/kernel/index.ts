import {
  kmod_graphics_vga_clear,
  kmod_graphics_vga_writeChar,
} from "./modules/graphics/vga";

export function kmain() {
  kmod_graphics_vga_clear();
  kmod_graphics_vga_writeChar(0, 0, "H", 0x0f);
  kmod_graphics_vga_writeChar(1, 0, "i", 0x0f);

  throw new Error("Simulated kernel panic");
}
