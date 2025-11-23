import {
  kmod_app_proc_generateHandle,
  kmod_app_proc_registerHandle,
  kmod_app_proc_running,
  kmod_app_proc_addExitListener,
} from "../../kernel/modules/app/app.kmod";
import { kmod_terminal_input_onKeyboardInput } from "../../kernel/modules/terminal/input";

export function oskrnl_input_onKeyPress(
  pid: string,
  handler: (key: string) => void
) {
  kmod_app_proc_registerHandle(pid, kmod_app_proc_generateHandle());
  const removeHandler = kmod_terminal_input_onKeyboardInput(function (
    key: string
  ) {
    const running = kmod_app_proc_running(pid);
    if (!running) return;

    handler(key);
  });

  kmod_app_proc_addExitListener(pid, removeHandler);
}
