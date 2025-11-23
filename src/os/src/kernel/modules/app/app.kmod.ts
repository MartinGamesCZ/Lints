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
import {
  procfs_mkdir,
  procfs_readFile,
  procfs_rm,
  procfs_writeFile,
} from "../../filesystem/procfs";

const exitListeners: { [pid: string]: (() => void)[] } = {};
const heapHandles: { [pid: string]: number } = {};

export function kmod_app_init() {
  oskrnl_register();
}

export function kmod_app_run(path: string, args: string) {
  const appPath = kmod_app_resolve(path);
  if (!appPath) throw new Error("App not found");

  const meta = JSON.parse(
    uiarrtostr(kmod_filesystem_readFile(Path.join(appPath, "meta.lam"))!)
  );

  if (!meta) throw new Error("App metadata not found");

  const entrypoint = Path.join(appPath, meta["app:entrypoint"]);
  const code = uiarrtostr(kmod_filesystem_readFile(entrypoint)!);

  const pid = kmod_app_proc_generateId().toString();

  kmod_app_proc_init(pid, meta["app:name"]!, args);
  kmod_app_proc_registerHandle(pid, "app");
  const heapHandle = iexec("var __oskrnl_procd_pid = " + pid + ";\n" + code);
  if (heapHandle) heapHandles[pid] = heapHandle;
  kmod_app_proc_unregisterHandle(pid, "app");

  return pid;
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

export function kmod_app_proc_generateId(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

export function kmod_app_proc_init(id: string, name: string, args: string) {
  const root = "/" + id;
  procfs_mkdir(root);
  procfs_writeFile(Path.join(root, "name"), name);
  procfs_writeFile(Path.join(root, "args"), args);
  procfs_writeFile(Path.join(root, "pid"), id);
  procfs_writeFile(Path.join(root, "handles"), "");
}

export function kmod_app_proc_getArgs(pid: string): string {
  const res = procfs_readFile(Path.join("/" + pid, "args"));
  return res as string;
}

export function kmod_app_proc_registerHandle(
  pid: string,
  handle: string
): string {
  const handles = procfs_readFile(Path.join("/" + pid, "handles")) as string;

  const handlesArr = handles == "" ? [] : handles.split(",");
  handlesArr.push(handle);

  procfs_writeFile(Path.join("/" + pid, "handles"), handlesArr.join(","));

  return handle;
}

export function kmod_app_proc_unregisterHandle(
  pid: string,
  handle: string
): void {
  const handles = procfs_readFile(Path.join("/" + pid, "handles")) as string;
  if (handles == "") return;

  const handlesArr = handles.split(",");
  handlesArr.splice(handlesArr.indexOf(handle), 1);

  procfs_writeFile(Path.join("/" + pid, "handles"), handlesArr.join(","));

  if (handlesArr.length < 1) kmod_app_proc_handleExit(pid);
}

export function kmod_app_proc_generateHandle(): string {
  return Math.floor(Math.random() * 0xffffffff).toString();
}

export function kmod_app_proc_handleExit(pid: string): void {
  procfs_writeFile(Path.join("/", pid + "/handles"), "");
  procfs_rm("/" + pid);

  if (exitListeners[pid]) {
    for (let i = 0; i < exitListeners[pid].length; i++) {
      exitListeners[pid][i]!();
    }
  }

  exitListeners[pid] = [];
  delete exitListeners[pid];

  if (heapHandles[pid]) {
    $destroyIsolatedHeap(heapHandles[pid]!);
    delete heapHandles[pid];
  }
}

export function kmod_app_proc_running(pid: string): boolean {
  const handles = procfs_readFile(Path.join("/" + pid, "handles")) as string;

  if (handles === null || handles === undefined) return false;

  return handles !== "";
}

export function kmod_app_proc_addExitListener(
  pid: string,
  listener: () => void
): void {
  if (!exitListeners[pid]) exitListeners[pid] = [];
  exitListeners[pid].push(listener);
}

export function kmod_app_proc_exit(pid: string): void {
  kmod_app_proc_handleExit(pid);
}
