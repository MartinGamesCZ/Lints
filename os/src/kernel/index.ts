import { Logger } from "../libs/logger";
import { kdriver_dev_pci_detectDevices } from "./drivers/dev/pci.kdriver";
import {
  kmod_console_clearScreen,
  kmod_console_outputString,
} from "./modules/console/console.kmod";
import { kmod_drivers_init } from "./modules/drivers.kmod";

export function kmain() {
  kmod_console_clearScreen();

  Logger.log("[Kernel] Starting kernel...");

  kmod_drivers_init();

  kdriver_dev_pci_detectDevices();

  return 0;
}
