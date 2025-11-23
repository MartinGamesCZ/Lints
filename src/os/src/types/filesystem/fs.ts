import type { DeviceType } from "../dev/device";

export type KFilesystemMountdata = KFilesystemMount[];

export type KFilesystemMount = {
  mountpoint: string;
  driver: KFilesystemDriver;
};

export type KFilesystemDirectReadResponse = number[];

export type KFilesystemDriver = {
  id: string;
  init: () => void;
  listDir(path: string): KFilesystemEntity[] | null;
  readFile(path: string): unknown;
  writeFile(path: string, content: unknown): void;
  createFile(path: string, content: unknown): void;
  mkdir(path: string): void;
  rm(path: string): void;
  stat(path: string): KFilesystemStat | null;
  directRead?(
    path: string,
    count: number,
    offset: number
  ): KFilesystemDirectReadResponse;
};

export type KFilesystemMemdata = KFilesystemEntity[];

export type KFilesystemEntity = {
  name: string;
  path: string;
  size: number;
  contents: unknown;
  type: "file" | "folder";
};

export type KFilesystemStat = {
  name: string;
  type: "file" | "folder";
  size: number;
};

export type KFilesystemDevice = KFilesystemEntity & {
  dtype: DeviceType;
  driver: unknown;
  data: unknown;
};

export type KFilesystemMemdev = (KFilesystemDevice | KFilesystemEntity)[];
