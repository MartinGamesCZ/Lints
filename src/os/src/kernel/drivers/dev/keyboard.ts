import { Keycode, RKeycode } from "../../../config/keyboard";
import { Logger } from "../../../lib/libstd/logger/logger.kmod";
import { bytein } from "../../../lib/libts/byte";
import { kmod_cpu_irq_register } from "../../modules/cpu/interrupts";
import { kmod_terminal_input_handleKeyboardInput } from "../../modules/terminal/input";

export function kdriver_dev_keyboard_handleInterrupt(): void {
  const scancode = bytein(0x60);

  const key = RKeycode[scancode as keyof typeof RKeycode] as
    | keyof typeof Keycode
    | undefined;

  //Logger.log(String(scancode));

  if (key == undefined) return;

  kmod_terminal_input_handleKeyboardInput(key);
}

export function kdriver_dev_keyboard_init(): void {
  if (!kmod_cpu_irq_register(1, kdriver_dev_keyboard_handleInterrupt, null)) {
    Logger.log("[keyboard] Failed to register keyboard interrupt");
    return;
  }

  let key = 0;
  while ((key = bytein(0x64) & 1) == 1) {
    bytein(0x60);
  }
}
