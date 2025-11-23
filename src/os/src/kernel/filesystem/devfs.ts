import { Path } from "../../lib/libstd/path";
import type { AtaDriveDescriptor } from "../../types/dev/ata/drive";
import type { DeviceType } from "../../types/dev/device";
import type {
  KFilesystemDevice,
  KFilesystemDirectReadResponse,
  KFilesystemDriver,
  KFilesystemEntity,
  KFilesystemMemdata,
  KFilesystemMemdev,
  KFilesystemStat,
} from "../../types/filesystem/fs";

const devfs_data: KFilesystemMemdev = [];

export function devfs_driver(): KFilesystemDriver {
  return {
    id: "devfs",
    init: devfs_init,
    listDir(path: string): (KFilesystemEntity | KFilesystemDevice)[] | null {
      return devfs_listDir(path);
    },
    readFile(path: string): unknown {
      throw new Error("Cannot read files in devfs.");
    },
    writeFile(path: string, content: unknown): void {
      throw new Error("Cannot write files in devfs.");
    },
    createFile(path: string, content: unknown): void {
      throw new Error("Cannot create files in devfs.");
    },
    mkdir(path: string): void {
      throw new Error("Cannot make directories in devfs.");
    },
    stat(path: string): KFilesystemStat | null {
      return devfs_statEntity(path);
    },
    rm(path: string): void {
      throw new Error("Cannot remove objects in devfs.")
    }
  };
}

export function devfs_init(): void {
  devfs_data.push({
    name: "root",
    path: "/",
    type: "folder",
    size: 0,
    contents: null,
  });
}

export function devfs_getEntity(
  path: string
): KFilesystemDevice | KFilesystemEntity | null {
  for (let i = 0; i < devfs_data.length; i++) {
    const entity = devfs_data[i]!;

    if (entity.path === path) return entity;
  }

  return null;
}

export function devfs_statEntity(path: string): KFilesystemStat | null {
  const entity = devfs_getEntity(path);
  if (!entity) return null;

  return {
    name: entity.name,
    type: entity.type,
    size: entity.size,
  };
}

export function devfs_mkdir(path: string): void {
  if (devfs_getEntity(path)) return;

  const parent = Path.dirname(path);
  if (!devfs_getEntity(parent)) return;

  devfs_data.push({
    name: Path.filename(path),
    path,
    type: "folder",
    size: 0,
    contents: null,
  });
}

export function devfs_listDir(
  path: string
): (KFilesystemEntity | KFilesystemDevice)[] | null {
  const entity = devfs_getEntity(path);
  if (!entity) return null;

  if (entity.type !== "folder") return null;

  const contents: (KFilesystemEntity | KFilesystemDevice)[] = [];

  for (let i = 0; i < devfs_data.length; i++) {
    const e = devfs_data[i]!;

    if (Path.dirname(e.path) === path) {
      contents.push(e);
    }
  }

  return contents;
}

export function devfs_registerDevice(
  path: string,
  type: DeviceType,
  driver: unknown,
  data: unknown
) {
  if (devfs_getEntity(path)) return;

  const parent = Path.dirname(path);
  if (!devfs_getEntity(parent)) return;

  devfs_data.push({
    name: Path.filename(path),
    path,
    type: "file",
    size: 0,
    contents: "",
    dtype: type,
    driver: driver,
    data: data,
  });
}

export function devfs_getDevice(path: string): KFilesystemDevice | null {
  const e = devfs_getEntity(path);
  if (!e) return null;
  if (!("driver" in e)) return null;

  return e;
}

export function devfs_directRead(
  path: string,
  count: number,
  offset: number
): KFilesystemDirectReadResponse | null {
  const device = devfs_getDevice(path);
  if (!device) return null;

  //return (device.driver as any).read(device.data, count, offset);
  return [];
}
