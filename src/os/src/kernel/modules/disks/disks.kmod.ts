import { Logger } from "../../../lib/libstd/logger/logger.kmod";
import { Path } from "../../../lib/libstd/path";
import { cchar, charc } from "../../../lib/libts/byte";
import { DeviceType } from "../../../types/dev/device";
import { DiskType, type Disk } from "../../../types/filesystem/disk";
import {
  kdriver_dev_ata_detectDisks,
  kdriver_dev_ata_fsDriver,
  kdriver_dev_ata_getDrive,
  kdriver_dev_ata_numberOfDrives,
  kdriver_dev_ata_partition_fsDriver,
  kdriver_dev_ata_readSectors,
} from "../../drivers/dev/ata";
import { devfs_registerDevice } from "../../filesystem/devfs";
import { sysfs_mkdir, sysfs_writeFile } from "../../filesystem/sysfs";

let disks: Disk[] = [];

export function kmod_disks_detectDisks() {
  kdriver_dev_ata_detectDisks();

  let cdrom = charc("a");
  let disk = charc("a");
  let numOfDisks = 0;

  for (let i = 0; i < kdriver_dev_ata_numberOfDrives(); ++i) {
    const descriptor = kdriver_dev_ata_getDrive(i);

    if (!descriptor.present) continue;

    let name = "";

    if (descriptor.atapi) {
      name = "cd" + cchar(cdrom);
      cdrom++;

      disks.push({
        dnum: numOfDisks,
        name: name,
        descriptor: descriptor,
        type: DiskType.ATAPI,
      });

      devfs_registerDevice(
        "/" + name,
        DeviceType.BlockDevice,
        null,
        descriptor
      );
    } else {
      name = "hd" + cchar(disk);
      disk++;

      disks.push({
        dnum: numOfDisks,
        name: name,
        descriptor: descriptor,
        type: DiskType.ATA,
      });

      devfs_registerDevice(
        "/" + name,
        DeviceType.BlockDevice,
        kdriver_dev_ata_fsDriver,
        descriptor
      );

      let part = charc("1");

      const partitions = kmod_disks_getPartitions(disks[numOfDisks]!);

      for (let n = 0; n < partitions.length; n++) {
        const partition = partitions[n];

        let part_name = name + cchar(part);
        part++;

        (partition as any).disk = disks[numOfDisks]!;

        devfs_registerDevice(
          "/" + part_name,
          DeviceType.BlockDevice,
          kdriver_dev_ata_partition_fsDriver,
          partition
        );
      }
    }

    const p = Path.join("/ata", name);

    sysfs_mkdir(p);
    sysfs_writeFile(Path.join(p, "model"), descriptor.model);
    sysfs_writeFile(Path.join(p, "serial"), descriptor.serial);
    sysfs_writeFile(Path.join(p, "firmware"), descriptor.firmware);

    numOfDisks++;
  }
}

export function kmod_disks_getPartitions(disk: Disk) {
  const sectors = kdriver_dev_ata_readSectors(disk.descriptor, 0, 1, 0);

  const signature = (sectors[511]! << 8) | sectors[510]!;

  if (signature !== 0xaa55) {
    throw new Error("Invalid MBR signature");
  }

  const partitions = [];

  // Parse partition table (starts at offset 446, 4 entries of 16 bytes each)
  for (let i = 0; i < 4; i++) {
    const offset = 446 + i * 16;

    const status = sectors[offset]!;
    const partitionType = sectors[offset + 4]!;

    // LBA of first sector (little-endian)
    const lbaStart =
      sectors[offset + 8]! |
      (sectors[offset + 9]! << 8) |
      (sectors[offset + 10]! << 16) |
      (sectors[offset + 11]! << 24);

    // Number of sectors (little-endian)
    const sectorCount =
      sectors[offset + 12]! |
      (sectors[offset + 13]! << 8) |
      (sectors[offset + 14]! << 16) |
      (sectors[offset + 15]! << 24);

    // Skip empty partition entries
    if (partitionType === 0 || sectorCount === 0) {
      continue;
    }

    partitions.push({
      index: i,
      bootable: status === 0x80,
      type: partitionType,
      lbaStart: lbaStart,
      sectors: sectorCount,
      size: sectorCount * 512,
    });

    Logger.log(
      "[Disk] Partition " +
        i +
        ": Type=0x" +
        partitionType.toString(16) +
        " " +
        "LBA=" +
        lbaStart +
        " Sectors=" +
        sectorCount +
        " " +
        "Bootable=" +
        (status === 0x80)
    );
  }

  return partitions;
}
