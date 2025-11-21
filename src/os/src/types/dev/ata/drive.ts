export type AtaDriveDescriptor = {
  controller: number;
  drive: number;
  present: boolean;
  slave: number;
  atapi: boolean;
  model: string;
  serial: string;
  firmware: string;
  size: number;
};
