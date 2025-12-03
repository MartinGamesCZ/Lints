import { PCIKDriver } from "../drivers/dev/pci.drv";
import type { KernelDriver } from "../drivers/kdriver";
import { KernelModule } from "./kmod";

export const DRIVERS: KernelDriver[] = [PCIKDriver.instance];

export class DriverKModule extends KernelModule {
  static instance: DriverKModule = new this();

  constructor() {
    super("driver");
  }

  static init() {
    DriverKModule.instance.init();
  }

  override init() {
    super.init();

    for (const driver of DRIVERS) {
      driver.init();
    }
  }
}
