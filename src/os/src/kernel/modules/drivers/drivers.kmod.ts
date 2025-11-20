import { kdriver_etc_serial_init } from "../../drivers/etc/serial";

const drivers = [kdriver_etc_serial_init];

export function kmod_drivers_init(): void {}

export function kmod_drivers_register(): void {
  for (let i = 0; i < drivers.length; i++) {
    drivers[i]!();
  }
}
