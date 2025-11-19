import { charc } from "../../../lib/libts/byte";
import {
  CFG_KMOD_GRAPGICS_VGA_MEM_ADDR,
  CFG_KMOD_GRAPHICS_VGA_HEIGHT,
  CFG_KMOD_GRAPHICS_VGA_WIDTH,
} from "./config";

export function kmod_graphics_vga_getCharAddr(x: number, y: number): number {
  return (
    CFG_KMOD_GRAPGICS_VGA_MEM_ADDR + (y * CFG_KMOD_GRAPHICS_VGA_WIDTH + x) * 2
  );
}

export function kmod_graphics_vga_getColorAddr(x: number, y: number): number {
  return (
    CFG_KMOD_GRAPGICS_VGA_MEM_ADDR +
    (y * CFG_KMOD_GRAPHICS_VGA_WIDTH + x) * 2 +
    1
  );
}

export function kmod_graphics_vga_clear() {
  for (let y = 0; y < CFG_KMOD_GRAPHICS_VGA_HEIGHT; y++) {
    for (let x = 0; x < CFG_KMOD_GRAPHICS_VGA_WIDTH; x++) {
      kmod_graphics_vga_writeChar(x, y, " ", 0x07);
    }
  }
}

export function kmod_graphics_vga_writeChar(
  x: number,
  y: number,
  char: string,
  color: number
) {
  const charAddr = kmod_graphics_vga_getCharAddr(x, y);
  const colorAddr = kmod_graphics_vga_getColorAddr(x, y);

  $addrw(charAddr, charc(char));
  $addrw(colorAddr, color);
}
