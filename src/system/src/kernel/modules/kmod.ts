import { Logger } from "../../lib/logger";

export class KernelModule {
  #name: string;
  #initialized: boolean = false;

  constructor(name: string) {
    this.#name = name;
  }

  init() {
    Logger.log(`[Kernel] Initializing ${this.#name} module...`);

    this.#initialized = true;
  }

  get initialized() {
    return this.#initialized;
  }
}
