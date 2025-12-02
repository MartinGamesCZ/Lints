import { Logger } from "../../../libs/logger";
import { Path } from "../../../libs/path";
import { sysfs, sysfs_mkdir, sysfs_writeFile } from "../../filesystem/sysfs";

export function kdriver_dev_pci_init() {
  sysfs_mkdir("/pci");
}

export function kdriver_dev_pci_detectDevices() {
  Logger.log("[PCI] Scanning...");

  for (let bus = 0; bus < 256; bus++) {
    for (let device = 0; device < 32; device++) {
      kdriver_dev_pci_checkDevice(bus, device, 0);

      const headerType = kdriver_dev_pci_getHeaderType(bus, device, 0);
      if ((headerType & 0x80) !== 0) {
        for (let func = 1; func < 8; func++) {
          kdriver_dev_pci_checkDevice(bus, device, func);
        }
      }
    }
  }
}

export function kdriver_dev_pci_checkDevice(
  bus: number,
  device: number,
  func: number
) {
  const data = kdriver_dev_pci_readConfigDword(bus, device, func, 0);

  if (data === 0 || data === -1) return;

  const vendorId = data & 0xffff;
  const deviceId = data >>> 16;

  if (vendorId === 0 || vendorId === 0xffff) return;

  const classCode = kdriver_dev_pci_getClassCode(bus, device, func);
  const subclass = kdriver_dev_pci_getSubclass(bus, device, func);

  const filename = bus + ":" + device + ":" + func;

  Logger.log(
    "[PCI] Found device pci:" +
      filename +
      " (vendor:" +
      vendorId.toString(16) +
      ", device:" +
      deviceId.toString(16) +
      ", class:" +
      classCode.toString(16) +
      ", subclass:" +
      subclass.toString(16) +
      ")"
  );

  const dirname = Path.join("/pci", filename);

  sysfs_mkdir(dirname);
  sysfs_writeFile(Path.join(dirname, "vendor"), "Intel");
  /*sysfs_writeFile(Path.join(dirname, "vendor"), vendorId.toString(16));
  sysfs_writeFile(Path.join(dirname, "device"), deviceId.toString(16));
  sysfs_writeFile(Path.join(dirname, "class"), classCode.toString(16));
  sysfs_writeFile(Path.join(dirname, "subclass"), subclass.toString(16));*/
}

export function kdriver_dev_pci_getDeviceId(
  bus: number,
  device: number,
  func: number
) {
  const data = kdriver_dev_pci_readConfigDword(bus, device, func, 0);

  return data >>> 16;
}

export function kdriver_dev_pci_getVendorId(
  bus: number,
  device: number,
  func: number
) {
  const data = kdriver_dev_pci_readConfigDword(bus, device, func, 0);

  return data & 0xffff;
}

export function kdriver_dev_pci_getClassCode(
  bus: number,
  device: number,
  func: number
) {
  const data = kdriver_dev_pci_readConfigDword(bus, device, func, 8);

  return (data >> 24) & 0xff;
}

export function kdriver_dev_pci_getSubclass(
  bus: number,
  device: number,
  func: number
) {
  const data = kdriver_dev_pci_readConfigDword(bus, device, func, 8);

  return (data >> 16) & 0xff;
}

export function kdriver_dev_pci_getHeaderType(
  bus: number,
  device: number,
  func: number
) {
  const data = kdriver_dev_pci_readConfigDword(bus, device, func, 12);

  return (data >> 16) & 0xff;
}

export function kdriver_dev_pci_readConfigDword(
  bus: number,
  device: number,
  func: number,
  offset: number
) {
  return $___native_systable_pci_read_config(bus, device, func, offset);
}
