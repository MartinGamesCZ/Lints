import { charc } from "../../../lib/libts/byte";
import {
  CFG_KMOD_GRAPGICS_VGA_MEM_ADDR,
  CFG_KMOD_GRAPHICS_VGA_HEIGHT,
  CFG_KMOD_GRAPHICS_VGA_WIDTH,
} from "./config";

let kmod_graphics_vga_lineBuf: string[] = [];
let init = false;

export function kmod_graphics_vga_init() {
  init = true;

  kmod_graphics_vga_clear();
}

export function kmod_graphics_vga_pushLine(line: string) {
  if (!init) return;

  kmod_graphics_vga_lineBuf.push(line);

  if (kmod_graphics_vga_lineBuf.length > CFG_KMOD_GRAPHICS_VGA_HEIGHT) {
    kmod_graphics_vga_lineBuf.shift();
  }

  kmod_graphics_vga_printLines();
}

export function kmod_graphics_vga_setLastLine(line: string) {
  if (!init) return;

  if (kmod_graphics_vga_lineBuf.length === 0) {
    kmod_graphics_vga_lineBuf.push(line);
  } else {
    kmod_graphics_vga_lineBuf[kmod_graphics_vga_lineBuf.length - 1] = line;
  }

  kmod_graphics_vga_printLines();
}

export function kmod_graphics_vga_printLines() {
  if (!init) return;

  for (let y = 0; y < CFG_KMOD_GRAPHICS_VGA_HEIGHT; y++) {
    const line = kmod_graphics_vga_lineBuf[y] || "";

    for (let x = 0; x < CFG_KMOD_GRAPHICS_VGA_WIDTH; x++) {
      let char = line[x];
      if (!char) char = " ";

      kmod_graphics_vga_writeChar(x, y, char, 0x0f);
    }
  }
}

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
  if (!init) return;

  kmod_graphics_vga_lineBuf = [];

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
  if (!init) return;

  const charAddr = kmod_graphics_vga_getCharAddr(x, y);
  const colorAddr = kmod_graphics_vga_getColorAddr(x, y);

  $addrw(charAddr, charc(char));
  $addrw(colorAddr, color);
}
