declare function $___native_systable_conout_outputString(string: string): void;
declare function $___native_systable_conout_clearScreen(): void;
declare function $___native_systable_conout_setAttribute(
  attribute: number
): void;

declare function $___native_systable_io_dwordin(port: number): number;
declare function $___native_systable_io_dwordout(
  port: number,
  value: number
): void;

declare function $___native_systable_pci_read_config(
  bus: number,
  device: number,
  func: number,
  offset: number
): number;

declare function $___native_systable_pci_write_config(
  bus: number,
  device: number,
  func: number,
  offset: number,
  value: number
): void;
