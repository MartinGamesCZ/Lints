import { kmod_app_run } from "../../kernel/modules/app/app.kmod";

export function oskrnl_app_launcher_run(path: string, args: string) {
  if ((globalThis as any).__oskrnl) {
    (globalThis as any).__oskrnl.app_args = args;
  }
  kmod_app_run(path);
}
