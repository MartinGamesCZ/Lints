import { Logger } from "../../lib/libstd/logger/logger.kmod";
import type {
  KFilesystemDriver,
  KFilesystemEntity,
  KFilesystemStat,
} from "../../types/filesystem/fs";

interface Fat32BootSector {
  bytesPerSector: number;
  sectorsPerCluster: number;
  reservedSectors: number;
  numberOfFATs: number;
  sectorsPerFAT: number;
  rootCluster: number;
  totalSectors: number;
}

interface Fat32State {
  driver: any;
  data: any;
  boot: Fat32BootSector;
  fatStart: number;
  dataStart: number;
}

interface DirectoryEntry {
  name: string;
  extension: string;
  attributes: number;
  firstCluster: number;
  fileSize: number;
}

const ATTR_READ_ONLY = 0x01;
const ATTR_HIDDEN = 0x02;
const ATTR_SYSTEM = 0x04;
const ATTR_VOLUME_ID = 0x08;
const ATTR_DIRECTORY = 0x10;
const ATTR_ARCHIVE = 0x20;
const ATTR_LONG_NAME =
  ATTR_READ_ONLY | ATTR_HIDDEN | ATTR_SYSTEM | ATTR_VOLUME_ID;

export function fat32_driver(driver: any, data: any): KFilesystemDriver {
  const state: Fat32State = {
    driver,
    data,
    boot: {} as Fat32BootSector,
    fatStart: 0,
    dataStart: 0,
  };

  return {
    id: "fat32",
    init() {
      return fat32_init(state);
    },
    listDir(path: string) {
      return fat32_listDir(state, path);
    },
    readFile(path: string) {
      return fat32_readFile(state, path);
    },
    writeFile(path: string, content: unknown) {
      throw new Error("FAT32 write not implemented");
    },
    createFile(path: string, content: unknown) {
      throw new Error("FAT32 createFile not implemented");
    },
    mkdir(path: string) {
      throw new Error("FAT32 mkdir not implemented");
    },
    stat(path: string) {
      return fat32_stat(state, path);
    },
    directRead(path: string, count: number, offset: number) {
      return fat32_directRead(state, path, count, offset);
    },
    rm(path: string): void {
      throw new Error("Cannot remove objects in fat32.");
    },
  };
}

function fat32_init(state: Fat32State): void {
  const bootSector = state.driver.read(state.data, 512, 0);

  state.boot = {
    bytesPerSector: bootSector[11] | (bootSector[12] << 8),
    sectorsPerCluster: bootSector[13],
    reservedSectors: bootSector[14] | (bootSector[15] << 8),
    numberOfFATs: bootSector[16],
    sectorsPerFAT:
      bootSector[36] |
      (bootSector[37] << 8) |
      (bootSector[38] << 16) |
      (bootSector[39] << 24),
    rootCluster:
      bootSector[44] |
      (bootSector[45] << 8) |
      (bootSector[46] << 16) |
      (bootSector[47] << 24),
    totalSectors:
      bootSector[32] |
      (bootSector[33] << 8) |
      (bootSector[34] << 16) |
      (bootSector[35] << 24),
  };

  state.fatStart = state.boot.reservedSectors;
  state.dataStart =
    state.boot.reservedSectors +
    state.boot.numberOfFATs * state.boot.sectorsPerFAT;
}

function fat32_clusterToSector(state: Fat32State, cluster: number): number {
  return state.dataStart + (cluster - 2) * state.boot.sectorsPerCluster;
}

function fat32_readCluster(state: Fat32State, cluster: number): number[] {
  const sector = fat32_clusterToSector(state, cluster);
  const size = state.boot.sectorsPerCluster * state.boot.bytesPerSector;
  return state.driver.read(
    state.data,
    size,
    sector * state.boot.bytesPerSector
  );
}

function fat32_getNextCluster(state: Fat32State, cluster: number): number {
  const fatOffset = cluster * 4;
  const fatSector =
    state.fatStart + Math.floor(fatOffset / state.boot.bytesPerSector);
  const entryOffset = fatOffset % state.boot.bytesPerSector;

  const sector = state.driver.read(
    state.data,
    state.boot.bytesPerSector,
    fatSector * state.boot.bytesPerSector
  );

  const nextCluster =
    sector[entryOffset] |
    (sector[entryOffset + 1] << 8) |
    (sector[entryOffset + 2] << 16) |
    (sector[entryOffset + 3] << 24);

  return nextCluster & 0x0fffffff;
}

function fat32_parseDirectoryEntry(
  data: number[],
  offset: number
): DirectoryEntry | null {
  if (data[offset] === 0x00) return null; // End of directory
  if (data[offset] === 0xe5) return null; // Deleted entry

  const attr = data[offset + 11];
  if ((attr & ATTR_LONG_NAME) === ATTR_LONG_NAME) return null; // LFN entry

  let name = "";
  for (let i = 0; i < 8; i++) {
    const c = data[offset + i];
    if (c !== 0x20) name += String.fromCharCode(c);
  }

  let extension = "";
  for (let i = 0; i < 3; i++) {
    const c = data[offset + 8 + i];
    if (c !== 0x20) extension += String.fromCharCode(c);
  }

  const firstClusterLow = data[offset + 26] | (data[offset + 27] << 8);
  const firstClusterHigh = data[offset + 20] | (data[offset + 21] << 8);
  const firstCluster = (firstClusterHigh << 16) | firstClusterLow;

  const fileSize =
    data[offset + 28] |
    (data[offset + 29] << 8) |
    (data[offset + 30] << 16) |
    (data[offset + 31] << 24);

  return {
    name: name.trim(),
    extension: extension.trim(),
    attributes: attr,
    firstCluster,
    fileSize,
  };
}

function fat32_listDir(
  state: Fat32State,
  path: string
): KFilesystemEntity[] | null {
  let cluster: number | undefined;

  if (path === "/") cluster = state.boot.rootCluster;
  else {
    const entry = fat32_findEntry(state, path);
    if (!entry) {
      return null;
    }
    cluster = entry.firstCluster;
  }

  if (!cluster) {
    return null;
  }

  const entries: KFilesystemEntity[] = [];
  let currentCluster = cluster;

  while (currentCluster < 0x0ffffff8) {
    const clusterData = fat32_readCluster(state, currentCluster);

    for (let i = 0; i < clusterData.length; i += 32) {
      const entry = fat32_parseDirectoryEntry(clusterData, i);
      if (!entry) continue;

      // Skip volume label entries
      if ((entry.attributes & ATTR_VOLUME_ID) !== 0) continue;

      const fullName = entry.extension
        ? entry.name + "." + entry.extension
        : entry.name;
      const isDir = (entry.attributes & ATTR_DIRECTORY) !== 0;

      entries.push({
        name: fullName,
        path: path === "/" ? "/" + fullName : path + "/" + fullName,
        type: isDir ? "folder" : "file",
        size: entry.fileSize,
        contents: null,
      });
    }

    currentCluster = fat32_getNextCluster(state, currentCluster);
  }

  return entries;
}

function fat32_findEntry(
  state: Fat32State,
  path: string
): DirectoryEntry | null {
  const parts = path.split("/").filter(function (p) {
    return p.length > 0;
  });
  if (parts.length === 0) return null;

  let currentCluster = state.boot.rootCluster;

  for (let i = 0; i < parts.length; i++) {
    const targetName = parts[i]!.toUpperCase();
    let found = false;

    while (currentCluster < 0x0ffffff8) {
      const clusterData = fat32_readCluster(state, currentCluster);

      for (let j = 0; j < clusterData.length; j += 32) {
        const entry = fat32_parseDirectoryEntry(clusterData, j);
        if (!entry) continue;

        const entryName = entry.extension
          ? entry.name + "." + entry.extension
          : entry.name;

        if (entryName.toUpperCase() === targetName) {
          if (i === parts.length - 1) return entry;
          currentCluster = entry.firstCluster;
          found = true;
          break;
        }
      }

      if (found) break;
      currentCluster = fat32_getNextCluster(state, currentCluster);
    }

    if (!found) return null;
  }

  return null;
}

function fat32_readFile(state: Fat32State, path: string): number[] {
  const entry = fat32_findEntry(state, path);
  if (!entry || (entry.attributes & ATTR_DIRECTORY) !== 0) {
    throw new Error("File not found or is a directory");
  }

  const data: number[] = [];
  let currentCluster = entry.firstCluster;
  let remaining = entry.fileSize;

  while (currentCluster < 0x0ffffff8 && remaining > 0) {
    const clusterData = fat32_readCluster(state, currentCluster);
    const bytesToCopy = Math.min(remaining, clusterData.length);

    for (let i = 0; i < bytesToCopy; i++) {
      data.push(clusterData[i]!);
    }

    remaining -= bytesToCopy;
    currentCluster = fat32_getNextCluster(state, currentCluster);
  }

  return data;
}

function fat32_stat(state: Fat32State, path: string): KFilesystemStat | null {
  if (path === "/") {
    return { name: "/", type: "folder", size: 0 };
  }

  const entry = fat32_findEntry(state, path);
  if (!entry) return null;

  const fullName = entry.extension
    ? entry.name + "." + entry.extension
    : entry.name;

  return {
    name: fullName,
    type: (entry.attributes & ATTR_DIRECTORY) !== 0 ? "folder" : "file",
    size: entry.fileSize,
  };
}

function fat32_directRead(
  state: Fat32State,
  path: string,
  count: number,
  offset: number
): number[] {
  const entry = fat32_findEntry(state, path);
  if (!entry || (entry.attributes & ATTR_DIRECTORY) !== 0) {
    throw new Error("File not found or is a directory");
  }

  const clusterSize = state.boot.sectorsPerCluster * state.boot.bytesPerSector;
  let currentCluster = entry.firstCluster;
  let currentOffset = 0;
  const data: number[] = [];

  // Skip to the cluster containing the offset
  while (offset >= currentOffset + clusterSize && currentCluster < 0x0ffffff8) {
    currentOffset += clusterSize;
    currentCluster = fat32_getNextCluster(state, currentCluster);
  }

  let remaining = count;
  const startOffsetInCluster = offset - currentOffset;

  while (remaining > 0 && currentCluster < 0x0ffffff8) {
    const clusterData = fat32_readCluster(state, currentCluster);
    const start = data.length === 0 ? startOffsetInCluster : 0;
    const bytesToCopy = Math.min(remaining, clusterData.length - start);

    for (let i = start; i < start + bytesToCopy; i++) {
      data.push(clusterData[i]!);
    }

    remaining -= bytesToCopy;
    currentCluster = fat32_getNextCluster(state, currentCluster);
  }

  return data;
}
