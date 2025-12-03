import { Logger } from "../lib/logger";
import { ConsoleKModule } from "./modules/console/console.kmod";

export function KMain() {
  Logger.clear();
  Logger.log("[Kernel] Initializing kernel...");

  ConsoleKModule.init();
}
