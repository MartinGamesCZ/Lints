import { kmod_app_run } from "../../kernel/modules/app/app.kmod";

export function oskrnl_app_launcher_run(path: string, args: string) {
  return kmod_app_run(path, args);
}
