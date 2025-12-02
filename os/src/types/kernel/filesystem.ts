export enum FilesystemType {
  SYSFS,
}

export interface Filesystem {
  type: FilesystemType;
  mkdir(path: string): void;
  ls(path: string): FilesystemEntity[] | null;
  writeFile(path: string, content: string): void;
}

export type FilesystemEntity = {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  contents: string | number | number[] | null;
};
