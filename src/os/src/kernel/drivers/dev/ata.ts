import { Logger } from "../../../lib/libstd/logger/logger.kmod";
import { bytein, byteout } from "../../../lib/libts/byte";
import { dwordin } from "../../../lib/libts/dword";
import { wordin } from "../../../lib/libts/word";
import type { AtaDriveDescriptor } from "../../../types/dev/ata/drive";
import type { BlockCache } from "../../../types/utils/block_cache";
import {
  blockCache_block,
  blockCache_create,
  blockCache_init,
} from "../../utils/block_cache";

const KDRIVER_DEV_ATA_PRIMARY = 0x1f0;
const KDRIVER_DEV_ATA_SECONDARY = 0x170;
const KDRIVER_DEV_ATA_PRIMARY_CTL = 0x3f6;
const KDRIVER_DEV_ATA_SECONDARY_CTL = 0x376;
const KDRIVER_DEV_ATA_CTL_nIEN = 0x02;
const KDRIVER_DEV_ATA_MASTER_BIT = 0;
const KDRIVER_DEV_ATA_SLAVE_BIT = 1;
const KDRIVER_DEV_ATA_DRV_HEAD = 6;
const KDRIVER_DEV_ATA_NSECTOR = 2;
const KDRIVER_DEV_ATA_SECTOR = 3;
const KDRIVER_DEV_ATA_LCYL = 4;
const KDRIVER_DEV_ATA_HCYL = 5;
const KDRIVER_DEV_ATA_STATUS = 7;
const KDRIVER_DEV_ATA_COMMAND = 7;
const KDRIVER_DEV_ATA_IDENTIFY = 0xec;
const KDRIVER_DEV_ATA_READ_SECTORS = 0x20;
const KDRIVER_DEV_ATA_STATUS_ERROR = 0x01;
const KDRIVER_DEV_ATA_STATUS_BSY = 0x80;
const KDRIVER_DEV_ATA_STATUS_DRQ = 0x08;
const KDRIVER_DEV_ATA_DATA = 0;
const KDRIVER_DEV_ATA_BLOCK_SIZE = 512;

let drives: AtaDriveDescriptor[] = [];
let cache = blockCache_create();

export function kdriver_dev_ata_init(): void {}

export function kdriver_dev_ata_400ns_delay(controller: number) {
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
  bytein(controller + KDRIVER_DEV_ATA_STATUS);
}

function ide_string(info: number[], start: number, size: number): string {
  const buffer = new Array(50);

  const t = info.slice(start);
  for (let i = 0; i < size; ++i) {
    const wordIndex = Math.floor(i / 2);
    const isHighByte = i % 2 === 1;

    buffer[i] = isHighByte ? (t[wordIndex]! >> 8) & 0xff : t[wordIndex]! & 0xff;
  }

  for (let i = 0; i < size; i += 2) {
    const c = buffer[i];
    buffer[i] = buffer[i + 1];
    buffer[i + 1] = c;
  }

  let end = size - 1;
  while (true) {
    const c = buffer[end];

    if (c > 32 && c < 127) {
      break;
    }

    if (end == 0) {
      break;
    }

    --end;
  }

  //buffer[end + 1] = 0;

  let target = "";
  for (let i = 0; i <= end; i++) {
    target += String.fromCharCode(buffer[i]);
  }

  return target;
}

export function kdriver_dev_ata_identify(drive: AtaDriveDescriptor) {
  byteout(
    drive.controller + KDRIVER_DEV_ATA_DRV_HEAD,
    0xa0 | (drive.slave << 4)
  );
  kdriver_dev_ata_400ns_delay(drive.controller);

  const floatingBus = bytein(drive.controller + KDRIVER_DEV_ATA_STATUS);
  if (floatingBus == 0xff) {
    return;
  }

  byteout(drive.controller + KDRIVER_DEV_ATA_COMMAND, KDRIVER_DEV_ATA_IDENTIFY);
  kdriver_dev_ata_400ns_delay(drive.controller);

  if (bytein(drive.controller + KDRIVER_DEV_ATA_STATUS) == 0) return;

  let notAta = false;
  let iterations = 0;
  while (1) {
    const status = bytein(drive.controller + KDRIVER_DEV_ATA_STATUS);
    iterations++;

    if (status & KDRIVER_DEV_ATA_STATUS_ERROR) {
      notAta = true;
      break;
    }

    if (
      !(status & KDRIVER_DEV_ATA_STATUS_BSY) &&
      status & KDRIVER_DEV_ATA_STATUS_DRQ
    )
      break;

    if (iterations > 100000) {
      return;
    }
  }

  drive.atapi = false;

  if (notAta) {
    const cl = bytein(drive.controller + KDRIVER_DEV_ATA_LCYL);
    const ch = bytein(drive.controller + KDRIVER_DEV_ATA_HCYL);

    if (cl == 0x14 && ch == 0xeb) drive.atapi = true;
    else if (cl == 0x69 && ch == 0x96) drive.atapi = true;
    else return;

    byteout(drive.controller + KDRIVER_DEV_ATA_COMMAND, 0xa1);
    kdriver_dev_ata_400ns_delay(drive.controller);
  }

  drive.present = true;

  const info = new Array(256);
  for (let i = 0; i < 256; i++) {
    info[i] = wordin(drive.controller + KDRIVER_DEV_ATA_DATA);
  }

  drive.model = ide_string(info, 27, 40);
  drive.serial = ide_string(info, 10, 20);
  drive.firmware = ide_string(info, 23, 8);

  const sectors = info[0] + 114;
  drive.size = sectors * 4096;

  Logger.log(
    "[ATA] Found drive " +
      drive.model +
      " (" +
      drive.serial +
      ") FW: " +
      drive.firmware +
      " Size: " +
      drive.size
  );
}

export function kdriver_dev_ata_numberOfDrives(): number {
  return 4;
}

export function kdriver_dev_ata_getDrive(n: number) {
  return drives[n]!;
}

export function kdriver_dev_ata_detectDisks(): void {
  blockCache_init(cache, KDRIVER_DEV_ATA_BLOCK_SIZE, 256);

  drives = new Array<AtaDriveDescriptor>(4);

  drives[0] = {
    controller: KDRIVER_DEV_ATA_PRIMARY,
    drive: 0xe0,
    present: false,
    slave: KDRIVER_DEV_ATA_MASTER_BIT,
    atapi: false,
    model: "",
    serial: "",
    firmware: "",
    size: 0,
  };
  drives[1] = {
    controller: KDRIVER_DEV_ATA_PRIMARY,
    drive: 0xf0,
    present: false,
    slave: KDRIVER_DEV_ATA_SLAVE_BIT,
    atapi: false,
    model: "",
    serial: "",
    firmware: "",
    size: 0,
  };
  drives[2] = {
    controller: KDRIVER_DEV_ATA_SECONDARY,
    drive: 0xe0,
    present: false,
    slave: KDRIVER_DEV_ATA_MASTER_BIT,
    atapi: false,
    model: "",
    serial: "",
    firmware: "",
    size: 0,
  };
  drives[3] = {
    controller: KDRIVER_DEV_ATA_SECONDARY,
    drive: 0xf0,
    present: false,
    slave: KDRIVER_DEV_ATA_SLAVE_BIT,
    atapi: false,
    model: "",
    serial: "",
    firmware: "",
    size: 0,
  };

  byteout(KDRIVER_DEV_ATA_PRIMARY_CTL, KDRIVER_DEV_ATA_CTL_nIEN);
  byteout(KDRIVER_DEV_ATA_SECONDARY_CTL, KDRIVER_DEV_ATA_CTL_nIEN);

  for (let i = 0; i < 4; i++) {
    const drive = drives[i]!;

    kdriver_dev_ata_identify(drive);
  }

  byteout(KDRIVER_DEV_ATA_PRIMARY_CTL, 0);
  byteout(KDRIVER_DEV_ATA_SECONDARY_CTL, 0);

  // TODO: INTERRUPTS
}

export function kdriver_dev_ata_readSectors(
  descriptor: AtaDriveDescriptor,
  start: number,
  count: number,
  read: number
) {
  let buffer: number[] = [];

  for (let i = 0; i < count; ++i) {
    const sectorNum = start + i;
    const valid = { valid: false };
    const block = blockCache_block(
      cache,
      (descriptor.controller << 8) + descriptor.drive,
      sectorNum,
      valid
    );

    if (!valid.valid) {
      // Need to actually read from disk
      byteout(
        descriptor.controller + KDRIVER_DEV_ATA_DRV_HEAD,
        0xe0 | (descriptor.slave << 4) | ((sectorNum >> 24) & 0x0f)
      );
      byteout(descriptor.controller + KDRIVER_DEV_ATA_NSECTOR, 1);
      byteout(descriptor.controller + KDRIVER_DEV_ATA_SECTOR, sectorNum & 0xff);
      byteout(
        descriptor.controller + KDRIVER_DEV_ATA_LCYL,
        (sectorNum >> 8) & 0xff
      );
      byteout(
        descriptor.controller + KDRIVER_DEV_ATA_HCYL,
        (sectorNum >> 16) & 0xff
      );
      byteout(
        descriptor.controller + KDRIVER_DEV_ATA_COMMAND,
        KDRIVER_DEV_ATA_READ_SECTORS
      );

      // Wait for drive to be ready
      let timeout = 0;
      while (timeout < 100000) {
        const status = bytein(descriptor.controller + KDRIVER_DEV_ATA_STATUS);
        if (
          !(status & KDRIVER_DEV_ATA_STATUS_BSY) &&
          status & KDRIVER_DEV_ATA_STATUS_DRQ
        ) {
          break;
        }
        timeout++;
      }

      // Read 256 words (512 bytes)
      for (let j = 0; j < 256; j++) {
        const word = wordin(descriptor.controller + KDRIVER_DEV_ATA_DATA);
        block[j * 2] = word & 0xff;
        block[j * 2 + 1] = (word >> 8) & 0xff;
      }
    }

    // Copy the block to the output buffer
    for (let n = 0; n < block.length; n++) {
      buffer.push(block[n]!);
    }

    read += 512;
  }

  return buffer;
}

export function kdriver_dev_ata_fsDriver_read(
  data: AtaDriveDescriptor,
  count: number,
  offset: number
) {
  if (count % KDRIVER_DEV_ATA_BLOCK_SIZE != 0) throw new Error("Invalid count");
  if (offset % KDRIVER_DEV_ATA_BLOCK_SIZE != 0)
    throw new Error("Invalid offset");

  const sectors = count / KDRIVER_DEV_ATA_BLOCK_SIZE;
  const start = offset / KDRIVER_DEV_ATA_BLOCK_SIZE;

  const buffer = kdriver_dev_ata_readSectors(data, start, sectors, 0);

  return buffer;
}

export function kdriver_dev_ata_partition_fsDriver_read(
  data: any,
  count: number,
  offset: number
) {
  if (count % KDRIVER_DEV_ATA_BLOCK_SIZE != 0) throw new Error("Invalid count");
  if (offset % KDRIVER_DEV_ATA_BLOCK_SIZE != 0)
    throw new Error("Invalid offset");

  const partition = data;
  const disk = partition.disk as { descriptor: AtaDriveDescriptor };

  const sectors = count / KDRIVER_DEV_ATA_BLOCK_SIZE;
  const start = partition.lbaStart + offset / KDRIVER_DEV_ATA_BLOCK_SIZE;

  const buffer = kdriver_dev_ata_readSectors(
    disk.descriptor,
    start,
    sectors,
    0
  );

  return buffer;
}

export const kdriver_dev_ata_fsDriver = {
  read: kdriver_dev_ata_fsDriver_read,
};

export const kdriver_dev_ata_partition_fsDriver = {
  read: kdriver_dev_ata_partition_fsDriver_read,
};
