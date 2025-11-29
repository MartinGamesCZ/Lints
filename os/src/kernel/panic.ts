import {
  kmod_console_clearScreen,
  kmod_console_outputString,
  kmod_console_setAttribute,
} from "./modules/console/console.kmod";

export function kpanic(message: string) {
  kmod_console_clearScreen();
  kmod_console_setAttribute(0x0c);
  kmod_console_outputString("Kernel panic: \\r\\n");
  kmod_console_outputString(message);
}
