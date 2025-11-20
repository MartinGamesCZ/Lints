import { portin, portout } from "../../../lib/libts/port";

const SERIAL_PORT_COM1 = 0x3f8;

export function kdriver_etc_serial_init() {
  portout(SERIAL_PORT_COM1 + 1, 0x00); // Disable all interrupts
  portout(SERIAL_PORT_COM1 + 3, 0x80); // Enable DLAB
  portout(SERIAL_PORT_COM1 + 0, 0x03); // 38400 baud
  portout(SERIAL_PORT_COM1 + 1, 0x00);
  portout(SERIAL_PORT_COM1 + 3, 0x03); // 8 bits, no parity, one stop bit
  portout(SERIAL_PORT_COM1 + 2, 0xc7); // Enable FIFO, clear them, with 14-byte threshold
  portout(SERIAL_PORT_COM1 + 4, 0x0b);
}

export function kdriver_etc_serial_isTransmitBufferEmpty(): boolean {
  return (portin(SERIAL_PORT_COM1 + 5) & 0x20) !== 0;
}

export function kdriver_etc_serial_transmit(byte: number): void {
  while (!kdriver_etc_serial_isTransmitBufferEmpty()) {}

  portout(SERIAL_PORT_COM1, byte);
}

export function kdriver_etc_serial_read(): number {
  return portin(SERIAL_PORT_COM1);
}
