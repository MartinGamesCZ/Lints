import { Logger } from "../../lib/libstd/logger/logger.kmod";
import { Path } from "../../lib/libstd/path";
import type {
  KFilesystemDriver,
  KFilesystemEntity,
  KFilesystemMemdata,
  KFilesystemStat,
} from "../../types/filesystem/fs";

const procfs_data: KFilesystemMemdata = [];

export function procfs_driver(): KFilesystemDriver {
  return {
    id: "procfs",
    init: procfs_init,
    listDir(path: string): KFilesystemEntity[] | null {
      return procfs_listDir(path);
    },
    readFile(path: string): unknown {
      return procfs_readFile(path);
    },
    writeFile(path: string, content: unknown): void {
      throw new Error("Cannot write files in procfs.");
    },
    createFile(path: string, content: unknown): void {
      throw new Error("Cannot create files in procfs.");
    },
    mkdir(path: string): void {
      throw new Error("Cannot make directories in procfs.");
    },
    stat(path: string): KFilesystemStat | null {
      return procfs_statEntity(path);
    },
    rm(path: string): void {
      procfs_rm(path);
    },
  };
}

export function procfs_init(): void {
  procfs_data.push({
    name: "root",
    path: "/",
    type: "folder",
    size: 0,
    contents: null,
  });
}

export function procfs_getEntity(path: string): KFilesystemEntity | null {
  for (let i = 0; i < procfs_data.length; i++) {
    const entity = procfs_data[i]!;

    if (entity.path === path) return entity;
  }

  return null;
}

export function procfs_statEntity(path: string): KFilesystemStat | null {
  const entity = procfs_getEntity(path);
  if (!entity) return null;

  return {
    name: entity.name,
    type: entity.type,
    size: entity.size,
  };
}

export function procfs_mkdir(path: string): void {
  if (procfs_getEntity(path)) return;

  const parent = Path.dirname(path);
  if (!procfs_getEntity(parent)) return;

  procfs_data.push({
    name: Path.filename(path),
    path,
    type: "folder",
    size: 0,
    contents: null,
  });
}

export function procfs_createFile(path: string, content: unknown): void {
  if (procfs_getEntity(path)) return;

  const parent = Path.dirname(path);
  if (!procfs_getEntity(parent)) return;

  const size = String(content).length;

  procfs_data.push({
    name: Path.filename(path),
    path,
    type: "file",
    size,
    contents: content,
  });
}

export function procfs_writeFile(path: string, content: unknown): void {
  const entity = procfs_getEntity(path);
  if (!entity) return procfs_createFile(path, content);

  if (entity.type !== "file") return;

  entity.contents = content;
  entity.size = String(content).length;
}

export function procfs_readFile(path: string): unknown {
  const entity = procfs_getEntity(path);
  if (!entity) return null;

  if (entity.type !== "file") return null;

  return entity.contents;
}

export function procfs_listDir(path: string): KFilesystemEntity[] | null {
  const entity = procfs_getEntity(path);
  if (!entity) return null;

  if (entity.type !== "folder") return null;

  const contents: KFilesystemEntity[] = [];

  for (let i = 0; i < procfs_data.length; i++) {
    const e = procfs_data[i]!;

    if (Path.dirname(e.path) === path) {
      contents.push(e);
    }
  }

  return contents;
}

export function procfs_rm(path: string): void {
  const entity = procfs_getEntity(path);
  if (!entity) return;

  if (entity.type === "file") {
    const index = procfs_data.indexOf(entity);

    if (index !== -1) procfs_data.splice(index, 1);
  } else if (entity.type === "folder") {
    const entitiesToRemove: KFilesystemEntity[] = [];
    const pathPrefix = path === "/" ? "/" : path + "/";

    for (let i = 0; i < procfs_data.length; i++) {
      const e = procfs_data[i]!;

      if (e.path === path || e.path.startsWith(pathPrefix)) {
        entitiesToRemove.push(e);
      }
    }

    for (let i = 0; i < entitiesToRemove.length; i++) {
      const toRemove = entitiesToRemove[i]!;
      const index = procfs_data.indexOf(toRemove);

      if (index !== -1) procfs_data.splice(index, 1);
    }
  }
}
