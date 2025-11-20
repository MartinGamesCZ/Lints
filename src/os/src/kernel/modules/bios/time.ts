import { portin, portout } from "../../../lib/libts/port";
import { padStart } from "../../../lib/libts/string";
import {
  CFG_KMOD_BIOS_TIME_CMOS_ADDR,
  CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR,
} from "./config";

export function kmod_bios_time_getCentury(): number {
  const val = 0x32;

  portout(CFG_KMOD_BIOS_TIME_CMOS_ADDR, val);
  const data = portin(CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR);

  return (data & 0x0f) + ((data >> 4) & 0x0f) * 10;
}

export function kmod_bios_time_getYear(): number {
  const val = 0x09;

  portout(CFG_KMOD_BIOS_TIME_CMOS_ADDR, val);
  const data = portin(CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR);

  return (data & 0x0f) + ((data >> 4) & 0x0f) * 10;
}

export function kmod_bios_time_getMonth(): number {
  const val = 0x08;

  portout(CFG_KMOD_BIOS_TIME_CMOS_ADDR, val);
  const data = portin(CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR);

  return (data & 0x0f) + ((data >> 4) & 0x0f) * 10;
}

export function kmod_bios_time_getDay(): number {
  const val = 0x07;

  portout(CFG_KMOD_BIOS_TIME_CMOS_ADDR, val);
  const data = portin(CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR);

  return (data & 0x0f) + ((data >> 4) & 0x0f) * 10;
}

export function kmod_bios_time_getHours(): number {
  const val = 0x04;

  portout(CFG_KMOD_BIOS_TIME_CMOS_ADDR, val);
  const data = portin(CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR);

  return (data & 0x0f) + ((data >> 4) & 0x0f) * 10;
}

export function kmod_bios_time_getMinutes(): number {
  const val = 0x02;

  portout(CFG_KMOD_BIOS_TIME_CMOS_ADDR, val);
  const data = portin(CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR);

  return (data & 0x0f) + ((data >> 4) & 0x0f) * 10;
}

export function kmod_bios_time_getSeconds(): number {
  const val = 0x00;

  portout(CFG_KMOD_BIOS_TIME_CMOS_ADDR, val);
  const data = portin(CFG_KMOD_BIOS_TIME_CMOS_DATA_ADDR);

  return (data & 0x0f) + ((data >> 4) & 0x0f) * 10;
}

export function kmod_bios_time_getTimestamp(): string {
  const century = kmod_bios_time_getCentury();
  const year = kmod_bios_time_getYear();
  const month = kmod_bios_time_getMonth();
  const day = kmod_bios_time_getDay();
  const hours = kmod_bios_time_getHours();
  const minutes = kmod_bios_time_getMinutes();
  const seconds = kmod_bios_time_getSeconds();

  return (
    century.toString() +
    year.toString() +
    "-" +
    padStart(month.toString(), 2, "0") +
    "-" +
    padStart(day.toString(), 2, "0") +
    "T" +
    padStart(hours.toString(), 2, "0") +
    ":" +
    padStart(minutes.toString(), 2, "0") +
    ":" +
    padStart(seconds.toString(), 2, "0") +
    +".000" +
    "Z"
  );
}
