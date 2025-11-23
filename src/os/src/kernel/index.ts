import { Logger } from "../lib/libstd/logger/logger.kmod";
import { charc } from "../lib/libts/byte";
import { padStart } from "../lib/libts/string";
import { uiarrtostr } from "../lib/libts/uint_arr";
import { getDate } from "../lib/sys/date";
import { kdriver_dev_ata_detectDisks } from "./drivers/dev/ata";
import { kdriver_dev_pci_detectDevices } from "./drivers/dev/pci";
import {
  kdriver_etc_serial_read,
  kdriver_etc_serial_transmit,
} from "./drivers/etc/serial";
import { devfs_driver, devfs_getDevice } from "./filesystem/devfs";
import { fat32_driver } from "./filesystem/fat32";
import { procfs_driver } from "./filesystem/procfs";
import { sysfs_driver, sysfs_readFile } from "./filesystem/sysfs";
import { kmod_app_init, kmod_app_run } from "./modules/app/app.kmod";
import { kmod_disks_detectDisks } from "./modules/disks/disks.kmod";
import {
  kmod_drivers_init,
  kmod_drivers_register,
} from "./modules/drivers/drivers.kmod";
import {
  kmod_filesystem_init,
  kmod_filesystem_listDir,
  kmod_filesystem_mount,
  kmod_filesystem_readFile,
} from "./modules/filesystem/filesystem.kmod";
import {
  kmod_graphics_vga_clear,
  kmod_graphics_vga_init,
  kmod_graphics_vga_pushLine,
  kmod_graphics_vga_setLastLine,
} from "./modules/graphics/graphics.kmod";
import {
  kmod_terminal_input_init,
  kmod_terminal_input_onKeyboardInput,
} from "./modules/terminal/input";

export function kmain() {
  kmod_drivers_init();

  kmod_drivers_register();
  Logger.log("[Kernel] Drivers initialized.");

  Logger.log("[Kernel] Initializing VGA module...");
  kmod_graphics_vga_init();

  Logger.log("[Kernel] Initializing filesystem module...");
  kmod_filesystem_init();
  kmod_filesystem_mount("/sys", sysfs_driver);
  kmod_filesystem_mount("/dev", devfs_driver);
  kmod_filesystem_mount("/proc", procfs_driver);

  Logger.log("[Kernel] Initializing terminal module...");
  kmod_terminal_input_init();

  Logger.log("[Kernel] Initializing PCI devices...");
  kdriver_dev_pci_detectDevices();

  Logger.log("[Kernel] Initializing drives...");
  kmod_disks_detectDisks();

  const dev = devfs_getDevice("/hda1");
  if (!dev) throw new Error("System drive not found");

  kmod_filesystem_mount("/disk", function () {
    return fat32_driver(dev.driver, dev.data);
  });

  Logger.log("[Kernel] Initializing app module...");
  kmod_app_init();

  Logger.log("[Kernel] Kernel initialized successfully.");

  const shell = uiarrtostr(kmod_filesystem_readFile("/disk/ushellc")!);

  kmod_app_run(shell, "");
}
