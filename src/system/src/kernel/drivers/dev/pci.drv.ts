import { Logger } from "../../../lib/logger";
import { numtohex } from "../../../util/hex";
import { SysFS } from "../../filesystem/sys.fs";
import { KernelDriver } from "../kdriver";

export class PCIKDriver extends KernelDriver {
  static instance: PCIKDriver = new this();

  constructor() {
    super("pci");
  }

  static init() {
    PCIKDriver.instance.init();
  }

  override init() {
    super.init();

    SysFS.instance.pMkdir("/pci");
    this.#detectDevices();
  }

  #detectDevices() {
    Logger.log("[PCI] Scanning...");

    for (let bus = 0; bus < 256; bus++) {
      for (let device = 0; device < 32; device++) {
        this.#checkDevice(bus, device, 0);

        const headerType = this.#getHeaderType(bus, device, 0);
        if ((headerType & 0x80) === 0) continue;

        for (let func = 1; func < 8; func++) {
          this.#checkDevice(bus, device, func);
        }
      }
    }
  }

  #checkDevice(bus: number, device: number, func: number) {
    const data = this.#readConfig(bus, device, func, 0);
    if (data === 0 || data === 0xffffffff) return;

    const vendorId = this.#getDeviceVendorId(bus, device, func);
    const deviceId = this.#getDeviceId(bus, device, func);
    const classId = this.#getDeviceClass(bus, device, func);
    const subclassId = this.#getDeviceSubclass(bus, device, func);

    const filename = `pci.${bus}.${device}.${func}`;

    Logger.log(
      `[PCI] Found device: ${filename} (vendor: ${numtohex(
        vendorId
      )}, device: ${numtohex(deviceId)}, class: ${numtohex(
        classId
      )}, subclass: ${numtohex(subclassId)})`
    );

    SysFS.instance.pMkdir(`/pci/${filename}`);
    SysFS.instance.pWriteFile(`/pci/${filename}/vendor`, numtohex(vendorId));
    SysFS.instance.pWriteFile(`/pci/${filename}/device`, numtohex(deviceId));
    SysFS.instance.pWriteFile(`/pci/${filename}/class`, numtohex(classId));
    SysFS.instance.pWriteFile(
      `/pci/${filename}/subclass`,
      numtohex(subclassId)
    );
  }

  #getDeviceId(bus: number, device: number, func: number) {
    return this.#readConfig(bus, device, func, 0) >>> 16;
  }

  #getDeviceVendorId(bus: number, device: number, func: number) {
    return this.#readConfig(bus, device, func, 0) & 0xffff;
  }

  #getDeviceClass(bus: number, device: number, func: number) {
    return (this.#readConfig(bus, device, func, 8) >> 24) & 0xff;
  }

  #getDeviceSubclass(bus: number, device: number, func: number) {
    return (this.#readConfig(bus, device, func, 8) >> 16) & 0xff;
  }

  #getHeaderType(bus: number, device: number, func: number) {
    return (this.#readConfig(bus, device, func, 12) >> 16) & 0xff;
  }

  #readConfig(bus: number, device: number, func: number, offset: number) {
    return kc.pciReadDword((bus << 16) | (device << 11) | (func << 8) | offset);
  }
}
