import { Logger } from "../../libs/logger";
import { Path } from "../../libs/path";
import {
  FilesystemType,
  type Filesystem,
  type FilesystemEntity,
} from "../../types/kernel/filesystem";

const sysfs_data: FilesystemEntity[] = [];

export function sysfs(): Filesystem {
  return {
    type: FilesystemType.SYSFS,
    mkdir: sysfs_mkdir,
    ls: sysfs_ls,
    writeFile(path, content) {
      throw new Error("Cannot write to sysfs");
    },
  };
}

export function sysfs_root(): FilesystemEntity {
  /*return {
    name: "$root",
    path: "/",
    size: 0,
    isDirectory: true,
    contents: null,
  };*/
}

export function sysfs_get(path: string): FilesystemEntity | null {
  if (path == "" || path == "/") return sysfs_root();

  for (let i = 0; i < sysfs_data.length; i++) {
    Logger.log(sysfs_data[i]);

    if (sysfs_data[i]!.path === path) {
      return sysfs_data[i]!;
    }
  }

  return null;
}

export function sysfs_mkdir(path: string) {
  if (sysfs_get(path)) return;

  const parent = sysfs_get(Path.dirname(path));
  if (!parent || !parent.isDirectory) return;

  Logger.log(path);

  /*sysfs_data.push({
    name: Path.filename(path),
    path: path,
    size: 0,
    isDirectory: true,
    contents: 0,
  });*/
}

export function sysfs_ls(path: string): FilesystemEntity[] | null {
  /*const entity = sysfs_get(path);
  if (!entity || !entity.isDirectory) return null;

  const result: FilesystemEntity[] = [];
  const prefix = path + "/";

  for (let i = 0; i < globalThis.sysfs_data.length; i++) {
    const itemPath = globalThis.sysfs_data[i]!.path;

    // Only include direct children (no additional slashes after the prefix)
    if (
      itemPath.startsWith(prefix) &&
      !itemPath.substring(prefix.length).includes("/")
    ) {
      result.push(globalThis.sysfs_data[i]!);
    }
  }

  return result;*/
}

export function sysfs_createFile(path: string, content: string) {
  if (sysfs_get(path)) return;

  /*const parent = sysfs_getParent(path);
  if (!parent || !parent.isDirectory) return;

  globalThis.sysfs_data.push({
    name: Path.filename(path),
    path: path,
    size: content.length,
    isDirectory: false,
    contents: content,
  });*/
}

export function sysfs_writeFile(path: string, content: string) {
  const entity = sysfs_get(path);
  /*if (!entity) return sysfs_createFile(path, content);
  if (entity.isDirectory) return;

  entity.contents = content;*/
}
