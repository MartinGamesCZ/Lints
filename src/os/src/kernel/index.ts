import { Logger } from "../lib/libstd/logger/logger.kmod";
import { charc } from "../lib/libts/byte";
import { padStart } from "../lib/libts/string";
import { getDate } from "../lib/sys/date";
import { kdriver_dev_pci_detectDevices } from "./drivers/dev/pci";
import {
  kdriver_etc_serial_read,
  kdriver_etc_serial_transmit,
} from "./drivers/etc/serial";
import { sysfs_driver, sysfs_readFile } from "./filesystem/sysfs";
import {
  kmod_drivers_init,
  kmod_drivers_register,
} from "./modules/drivers/drivers.kmod";
import {
  kmod_filesystem_init,
  kmod_filesystem_mount,
  kmod_filesystem_readFile,
} from "./modules/filesystem/filesystem.kmod";
import {
  kmod_graphics_vga_clear,
  kmod_graphics_vga_init,
  kmod_graphics_vga_pushLine,
} from "./modules/graphics/graphics.kmod";
import {
  kmod_terminal_input_init,
  kmod_terminal_input_onKeyboardInput,
} from "./modules/terminal/input";

export function kmain() {
  kmod_drivers_init();

  kmod_drivers_register();
  Logger.log("[Kernel] Drivers initialized.");

  Logger.log("[Kernel] Initializing filesystem module...");
  kmod_filesystem_init();
  kmod_filesystem_mount("/sys", sysfs_driver);

  Logger.log("[Kernel] Initializing terminal module...");
  kmod_terminal_input_init();

  Logger.log("[Kernel] Initializing PCI devices...");
  kdriver_dev_pci_detectDevices();

  Logger.log("[Kernel] Initializing VGA module...");
  kmod_graphics_vga_init();
  kmod_graphics_vga_pushLine("[Kernel] Kernel initialized successfully.");

  kmod_terminal_input_onKeyboardInput(function (keycode) {
    kmod_graphics_vga_pushLine(keycode);
  });
}
