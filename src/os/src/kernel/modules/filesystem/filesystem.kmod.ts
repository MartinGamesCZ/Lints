import { Logger } from "../../../lib/libstd/logger/logger.kmod";
import type {
  KFilesystemDriver,
  KFilesystemEntity,
  KFilesystemMount,
  KFilesystemMountdata,
  KFilesystemStat,
} from "../../../types/filesystem/fs";

const kmod_filesystem_data: KFilesystemMountdata = [];

export function kmod_filesystem_init(): void {}

export function kmod_filesystem_mount(
  mpoint: string,
  drv: () => KFilesystemDriver
): void {
  const driver = drv();

  driver.init();

  kmod_filesystem_data.push({
    mountpoint: mpoint,
    driver: driver,
  });

  Logger.log("[Filesystem] Mounted " + driver.id + " at " + mpoint);
}

export function kmod_filesystem_findMount(p: string): KFilesystemMount | null {
  for (let i = 0; i < kmod_filesystem_data.length; i++) {
    const mount = kmod_filesystem_data[i]!;

    if (p.startsWith(mount.mountpoint)) {
      return mount;
    }
  }

  return null;
}

export function kmod_filesystem_stripMountpoint(
  mount: KFilesystemMount,
  p: string
): string {
  if (mount.mountpoint === "/") return p;

  return p.slice(mount.mountpoint.length) || "/";
}

export function kmod_filesystem_listDir(
  path: string
): KFilesystemEntity[] | null {
  const mount = kmod_filesystem_findMount(path);
  if (!mount) return null;

  const strippedPath = kmod_filesystem_stripMountpoint(mount, path);

  return mount.driver.listDir(strippedPath);
}

export function kmod_filesystem_readFile(path: string): unknown {
  const mount = kmod_filesystem_findMount(path);
  if (!mount) return null;

  const strippedPath = kmod_filesystem_stripMountpoint(mount, path);

  return mount.driver.readFile(strippedPath);
}

export function kmod_filesystem_writeFile(
  path: string,
  content: unknown
): void {
  const mount = kmod_filesystem_findMount(path);
  if (!mount) return;

  const strippedPath = kmod_filesystem_stripMountpoint(mount, path);

  mount.driver.writeFile(strippedPath, content);
}

export function kmod_filesystem_createFile(
  path: string,
  content: unknown
): void {
  const mount = kmod_filesystem_findMount(path);
  if (!mount) return;

  const strippedPath = kmod_filesystem_stripMountpoint(mount, path);

  mount.driver.createFile(strippedPath, content);
}

export function kmod_filesystem_mkdir(path: string): void {
  const mount = kmod_filesystem_findMount(path);
  if (!mount) return;

  const strippedPath = kmod_filesystem_stripMountpoint(mount, path);

  mount.driver.mkdir(strippedPath);
}

export function kmod_filesystem_stat(path: string): KFilesystemStat | null {
  const mount = kmod_filesystem_findMount(path);
  if (!mount) return null;

  const strippedPath = kmod_filesystem_stripMountpoint(mount, path);

  return mount.driver.stat(strippedPath);
}
