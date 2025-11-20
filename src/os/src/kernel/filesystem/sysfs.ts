import { Logger } from "../../lib/libstd/logger/logger.kmod";
import { Path } from "../../lib/libstd/path";
import type {
  KFilesystemDriver,
  KFilesystemEntity,
  KFilesystemMemdata,
  KFilesystemStat,
} from "../../types/filesystem/fs";

const sysfs_data: KFilesystemMemdata = [];

export function sysfs_driver(): KFilesystemDriver {
  return {
    id: "sysfs",
    init: sysfs_init,
    listDir(path: string): KFilesystemEntity[] | null {
      return sysfs_listDir(path);
    },
    readFile(path: string): unknown {
      return sysfs_readFile(path);
    },
    writeFile(path: string, content: unknown): void {
      throw new Error("Cannot write to sysfs files.");
    },
    createFile(path: string, content: unknown): void {
      throw new Error("Cannot create files in sysfs.");
    },
    mkdir(path: string): void {
      throw new Error("Cannot create directories in sysfs.");
    },
    stat(path: string): KFilesystemStat | null {
      return sysfs_statEntity(path);
    },
  };
}

export function sysfs_init(): void {
  sysfs_data.push({
    name: "root",
    path: "/",
    type: "folder",
    size: 0,
    contents: null,
  });

  sysfs_mkdir("/pci");
}

export function sysfs_getEntity(path: string): KFilesystemEntity | null {
  for (let i = 0; i < sysfs_data.length; i++) {
    const entity = sysfs_data[i]!;

    if (entity.path === path) return entity;
  }

  return null;
}

export function sysfs_statEntity(path: string): KFilesystemStat | null {
  const entity = sysfs_getEntity(path);
  if (!entity) return null;

  return {
    name: entity.name,
    type: entity.type,
    size: entity.size,
  };
}

export function sysfs_mkdir(path: string): void {
  if (sysfs_getEntity(path)) return;

  const parent = Path.dirname(path);
  if (!sysfs_getEntity(parent)) return;

  sysfs_data.push({
    name: Path.filename(path),
    path,
    type: "folder",
    size: 0,
    contents: null,
  });
}

export function sysfs_createFile(path: string, content: unknown): void {
  if (sysfs_getEntity(path)) return;

  const parent = Path.dirname(path);
  if (!sysfs_getEntity(parent)) return;

  const size = String(content).length;

  sysfs_data.push({
    name: Path.filename(path),
    path,
    type: "file",
    size,
    contents: content,
  });
}

export function sysfs_writeFile(path: string, content: unknown): void {
  const entity = sysfs_getEntity(path);
  if (!entity) return sysfs_createFile(path, content);

  if (entity.type !== "file") return;

  entity.contents = content;
  entity.size = String(content).length;
}

export function sysfs_readFile(path: string): unknown {
  const entity = sysfs_getEntity(path);
  if (!entity) return null;

  if (entity.type !== "file") return null;

  return entity.contents;
}

export function sysfs_listDir(path: string): KFilesystemEntity[] | null {
  const entity = sysfs_getEntity(path);
  if (!entity) return null;

  if (entity.type !== "folder") return null;

  const contents: KFilesystemEntity[] = [];

  for (let i = 0; i < sysfs_data.length; i++) {
    const e = sysfs_data[i]!;

    if (Path.dirname(e.path) === path) {
      contents.push(e);
    }
  }

  return contents;
}
