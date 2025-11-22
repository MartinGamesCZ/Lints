import { Logger } from "../../../lib/libstd/logger/logger.kmod";
import { Path } from "../../../lib/libstd/path";
import { iexec } from "../../../lib/libts/exec";
import { uiarrtostr } from "../../../lib/libts/uint_arr";
import {
  kmod_filesystem_listDir,
  kmod_filesystem_readFile,
} from "../filesystem/filesystem.kmod";
import { oskrnl_register } from "../../../oskrnl";

export function kmod_app_init() {
  oskrnl_register();
}

export function kmod_app_run(path: string) {
  const meta = JSON.parse(
    uiarrtostr(kmod_filesystem_readFile(Path.join(path, "meta.lam"))!)
  );

  if (!meta) throw new Error("App metadata not found");

  const entrypoint = Path.join(path, meta["app:entrypoint"]);
  const code = uiarrtostr(kmod_filesystem_readFile(entrypoint)!);

  iexec(code);
}
