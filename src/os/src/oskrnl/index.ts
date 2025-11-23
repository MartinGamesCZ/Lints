import { oskrnl_app_launcher_run } from "./app/launcher";
import {
  oskrnl_app_proc_addExitListener,
  oskrnl_app_proc_exit,
  oskrnl_app_proc_getArgs,
  oskrnl_app_proc_running,
} from "./app/proc";
import { oskrnl_console_log, oskrnl_console_update } from "./console/console";
import { oskrnl_input_onKeyPress } from "./input/input";

export function oskrnl_register() {
  (globalThis as any).__oskrnl = {
    console_log: oskrnl_console_log,
    console_update: oskrnl_console_update,
    input_onKeyPress: oskrnl_input_onKeyPress,
    app_launcher_run: oskrnl_app_launcher_run,
    app_proc_getArgs: oskrnl_app_proc_getArgs,
    app_proc_addExitListener: oskrnl_app_proc_addExitListener,
    app_proc_exit: oskrnl_app_proc_exit,
    app_proc_running: oskrnl_app_proc_running,
  };
}
