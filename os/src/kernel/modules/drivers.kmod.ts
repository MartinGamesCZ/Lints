import { Logger } from "../../libs/logger";
import { kdriver_dev_pci_init } from "../drivers/dev/pci.kdriver";

const drivers = [kdriver_dev_pci_init];

export function kmod_drivers_init() {
  Logger.log("[Kernel] Initializing drivers...");

  for (let i = 0; i < drivers.length; i++) {
    drivers[i]!();
  }
}
