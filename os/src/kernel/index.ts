import { Logger } from "../libs/logger";
import {
  kmod_console_clearScreen,
  kmod_console_outputString,
} from "./modules/console/console.kmod";

export function kmain() {
  kmod_console_clearScreen();

  Logger.log("[Kernel] Starting kernel...");

  return 0;
}
