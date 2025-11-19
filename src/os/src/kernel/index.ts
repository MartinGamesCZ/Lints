import {
  kmod_graphics_vga_clear,
  kmod_graphics_vga_init,
  kmod_graphics_vga_pushLine,
} from "./modules/graphics/vga";

export function kmain() {
  kmod_graphics_vga_init();

  globalThis.console = {
    log: function (msg: string) {
      kmod_graphics_vga_pushLine(String(msg));
    },
  } as any;

  eval("console.log('TS-DOS Program Started!!');");
}
