import { dwordin, dwordout } from "../../../lib/libts/dword";
import { portin, portout } from "../../../lib/libts/port";
import { Logger } from "../../../lib/libstd/logger/logger.kmod";

const KDRIVER_PCI_CONFIG_ADDR = 0xcf8;
const KDRIVER_PCI_CONFIG_DATA = 0xcfc;

export function kdriver_dev_pci_init() {}

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
  const vendorId = kdriver_dev_pci_getVendorId(bus, device, func);

  if (vendorId === 0xffff) return;

  const deviceId = kdriver_dev_pci_getDeviceId(bus, device, func);
  const classCode = kdriver_dev_pci_getClassCode(bus, device, func);
  const subclass = kdriver_dev_pci_getSubclass(bus, device, func);

  Logger.log(
    "[PCI] Found device pci:" +
      bus +
      ":" +
      device +
      ":" +
      func +
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
}

export function kdriver_dev_pci_getDeviceId(
  bus: number,
  device: number,
  func: number
) {
  const data = kdriver_dev_pci_readConfigDword(bus, device, func, 0);

  return data >> 16;
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
  const address =
    (1 << 31) | (bus << 16) | (device << 11) | (func << 8) | (offset & 0xfc);

  dwordout(KDRIVER_PCI_CONFIG_ADDR, address);
  const data = dwordin(KDRIVER_PCI_CONFIG_DATA);

  return data;
}
