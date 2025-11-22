import { charc } from "../../libts/byte";
import { kdriver_etc_serial_transmit } from "../../../kernel/drivers/etc/serial";
import {
  kmod_graphics_vga_pushLine,
  kmod_graphics_vga_setLastLine,
} from "../../../kernel/modules/graphics/vga";

export const Logger = {
  log(message: string) {
    kmod_graphics_vga_pushLine(message);

    for (let i = 0; i < message.length; i++) {
      kdriver_etc_serial_transmit(charc(message[i]!));
    }

    kdriver_etc_serial_transmit(charc("\n"));
  },
  update(message: string) {
    kmod_graphics_vga_setLastLine(message);

    kdriver_etc_serial_transmit(charc("\x1b[2K"));
    kdriver_etc_serial_transmit(charc("\r"));
    for (let i = 0; i < message.length; i++) {
      kdriver_etc_serial_transmit(charc(message[i]!));
    }
  },
};
