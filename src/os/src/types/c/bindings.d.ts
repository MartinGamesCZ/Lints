declare function $addrw(address: number, value: number): void;
declare function $ptin(port: number): number;
declare function $ptout(port: number, value: number): void;
declare function $bytein(port: number): number;
declare function $byteout(port: number, value: number): void;
declare function $dwordin(port: number): number;
declare function $dwordout(port: number, value: number): void;
declare function $wordin(port: number): number;
declare function $wordout(port: number, value: number): void;
declare const $irqregister: (
  irq: number,
  handler: (irqNum: number) => void
) => boolean;
declare function $isolatedExec(code: string): number;
declare function $destroyIsolatedHeap(handle: number): void;
