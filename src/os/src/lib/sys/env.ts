import { kmod_filesystem_readFile } from "../../kernel/modules/filesystem/filesystem.kmod";
import { uiarrtostr } from "../libts/uint_arr";

export function getEnv(key: string): string | null {
  const data = uiarrtostr(kmod_filesystem_readFile("/disk/uenv")!);
  const lines = data.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i]!.split("=");

    if (kv[0] == key) return kv[1]!;
  }

  return null;
}

export function getPathEnv(): string[] | null {
  const path = getEnv("PATH");
  if (!path) return null;

  return path.split(":");
}
