import { oskrnl_console_log, oskrnl_console_update } from "./console/console";
import { oskrnl_input_onKeyPress } from "./input/input";

export function oskrnl_register() {
  (globalThis as any).__oskrnl = {
    console_log: oskrnl_console_log,
    console_update: oskrnl_console_update,
    input_onKeyPress: oskrnl_input_onKeyPress,
  };
}
