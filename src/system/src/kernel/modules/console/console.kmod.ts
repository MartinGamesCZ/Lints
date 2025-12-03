import { KernelModule } from "../kmod";

export class ConsoleKModule extends KernelModule {
  static instance: ConsoleKModule = new this();

  constructor() {
    super("console");
  }

  static init() {
    ConsoleKModule.instance.init();
  }

  println(msg: string) {
    if (!this.initialized) return;

    kc.println(msg);
  }

  clear() {
    if (!this.initialized) return;

    kc.clearScreen();
  }
}
