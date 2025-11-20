import { charc } from "../lib/libts/byte";
import { padStart } from "../lib/libts/string";
import { getDate } from "../lib/sys/date";
import { kdriver_dev_pci_detectDevices } from "./drivers/dev/pci";
import {
  kdriver_etc_serial_read,
  kdriver_etc_serial_transmit,
} from "./drivers/etc/serial";
import {
  kmod_drivers_init,
  kmod_drivers_register,
} from "./modules/drivers/drivers.kmod";
import {
  kmod_graphics_vga_clear,
  kmod_graphics_vga_init,
  kmod_graphics_vga_pushLine,
} from "./modules/graphics/graphics.kmod";

export function kmain() {
  kmod_drivers_init();

  kmod_drivers_register();

  kdriver_dev_pci_detectDevices();

  kmod_graphics_vga_init();
  kmod_graphics_vga_pushLine("[Kernel] Kernel initialized successfully.");
  kmod_graphics_vga_pushLine("Current date: " + getDate().toDateString());
}
