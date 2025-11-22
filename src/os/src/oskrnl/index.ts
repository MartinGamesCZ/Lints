import { oskrnl_app_launcher_run } from "./app/launcher";
import { oskrnl_console_log, oskrnl_console_update } from "./console/console";
import { oskrnl_input_onKeyPress } from "./input/input";

export function oskrnl_register() {
  (globalThis as any).__oskrnl = {
    app_args: "why",
    console_log: oskrnl_console_log,
    console_update: oskrnl_console_update,
    input_onKeyPress: oskrnl_input_onKeyPress,
    app_launcher_run: oskrnl_app_launcher_run,
  };
}
