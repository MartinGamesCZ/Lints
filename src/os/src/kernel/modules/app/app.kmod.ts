import { Logger } from "../../../lib/libstd/logger/logger.kmod";
import { Path } from "../../../lib/libstd/path";
import { iexec } from "../../../lib/libts/exec";
import { uiarrtostr } from "../../../lib/libts/uint_arr";
import {
  kmod_filesystem_listDir,
  kmod_filesystem_readFile,
  kmod_filesystem_stat,
} from "../filesystem/filesystem.kmod";
import { oskrnl_register } from "../../../oskrnl";
import { getPathEnv } from "../../../lib/sys/env";

export function kmod_app_init() {
  oskrnl_register();
}

export function kmod_app_run(path: string) {
  const appPath = kmod_app_resolve(path);
  if (!appPath) throw new Error("App not found");

  const meta = JSON.parse(
    uiarrtostr(kmod_filesystem_readFile(Path.join(appPath, "meta.lam"))!)
  );

  if (!meta) throw new Error("App metadata not found");

  const entrypoint = Path.join(appPath, meta["app:entrypoint"]);
  const code = uiarrtostr(kmod_filesystem_readFile(entrypoint)!);

  iexec(code);
}

export function kmod_app_resolve(path: string): string | null {
  if (kmod_filesystem_stat(path)) return path;

  const pathEnv = getPathEnv();
  if (!pathEnv) return null;

  for (let i = 0; i < pathEnv.length; i++) {
    const p = Path.join(pathEnv[i]!, path);
    if (kmod_filesystem_stat(p)) return p;
  }

  return null;
}
