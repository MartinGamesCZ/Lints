import { Logger } from "../lib/logger";
import { SysFS } from "./filesystem/sys.fs";
import { ConsoleKModule } from "./modules/console/console.kmod";
import { VFSKModule } from "./modules/vfs/vfs.kmod";

export function KMain() {
  Logger.clear();
  Logger.log("[Kernel] Initializing kernel...");

  ConsoleKModule.init();
  VFSKModule.init();
  VFSKModule.instance.mount(SysFS.instance, "/sys");

  SysFS.instance.pMkdir("/pci");
  SysFS.instance.pWriteFile("/pci/test", "test");

  Logger.log(SysFS.instance.readFile("/pci/test"));
}
