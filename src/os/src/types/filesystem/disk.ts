import type { AtaDriveDescriptor } from "../dev/ata/drive";

export type Disk = {
  dnum: number;
  type: DiskType;
  descriptor: AtaDriveDescriptor;
  name: string;
};

export enum DiskType {
  ATA,
  ATAPI,
}
