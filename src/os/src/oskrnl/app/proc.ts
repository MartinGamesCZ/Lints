import {
  kmod_app_proc_addExitListener,
  kmod_app_proc_exit,
  kmod_app_proc_getArgs,
  kmod_app_proc_running,
} from "../../kernel/modules/app/app.kmod";

export function oskrnl_app_proc_getArgs(pid: string): string {
  return kmod_app_proc_getArgs(pid);
}

export function oskrnl_app_proc_addExitListener(
  pid: string,
  listener: () => void
): void {
  kmod_app_proc_addExitListener(pid, listener);
}

export function oskrnl_app_proc_exit(pid: string): void {
  kmod_app_proc_exit(pid);
}

export function oskrnl_app_proc_running(pid: string): boolean {
  return kmod_app_proc_running(pid);
}
