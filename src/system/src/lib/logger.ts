import { ConsoleKModule } from "../kernel/modules/console/console.kmod";

export class Logger {
  static log(msg: string) {
    if (!ConsoleKModule.instance.initialized)
      return Logger.fallbackConsolePrintln(msg);

    ConsoleKModule.instance.println(msg);
  }

  static clear() {
    if (!ConsoleKModule.instance.initialized)
      return Logger.fallbackConsoleClearScreen();

    ConsoleKModule.instance.clear();
  }

  static fallbackConsolePrintln(msg: string) {
    kc.println(msg);
  }

  static fallbackConsoleClearScreen() {
    kc.clearScreen();
  }
}
