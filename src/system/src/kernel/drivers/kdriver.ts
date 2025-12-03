import { Logger } from "../../lib/logger";

export class KernelDriver {
  #name: string;
  #initialized: boolean = false;

  constructor(name: string) {
    this.#name = name;
  }

  init() {
    Logger.log(`[Kernel] Initializing ${this.#name} driver...`);

    this.#initialized = true;
  }

  get initialized() {
    return this.#initialized;
  }
}
