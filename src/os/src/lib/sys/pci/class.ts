import { KDriverPCIClass } from "../../../types/dev/pci/class";

const sysPCIClassNames = {
  [KDriverPCIClass.MassStorageController]: "Mass Storage Controller",
  [KDriverPCIClass.NetworkController]: "Network Controller",
  [KDriverPCIClass.DisplayController]: "Display Controller",
  [KDriverPCIClass.MultimediaController]: "Multimedia Controller",
  [KDriverPCIClass.MemoryController]: "Memory Controller",
  [KDriverPCIClass.BridgeDevice]: "Bridge Device",
  [KDriverPCIClass.SimpleCommunicationsController]:
    "Simple Communications Controller",
  [KDriverPCIClass.BaseSystemPeripheral]: "Base System Peripheral",
  [KDriverPCIClass.InputDevice]: "Input Device",
  [KDriverPCIClass.DockingStation]: "Docking Station",
  [KDriverPCIClass.Processors]: "Processors",
  [KDriverPCIClass.SerialBusController]: "Serial Bus Controller",
  [KDriverPCIClass.WirelessController]: "Wireless Controller",
  [KDriverPCIClass.IntelligentIOController]: "Intelligent I/O Controller",
  [KDriverPCIClass.SatelliteCommunicationController]:
    "Satellite Communication Controller",
  [KDriverPCIClass.EncryptionDecryptionController]:
    "Encryption/Decryption Controller",
  [KDriverPCIClass.DataAcquisitionAndSignalProcessingController]:
    "Data Acquisition and Signal Processing Controller",
};

export function sys_pci_class_name(classId: KDriverPCIClass): string {
  return sysPCIClassNames[classId] || "Unknown";
}
