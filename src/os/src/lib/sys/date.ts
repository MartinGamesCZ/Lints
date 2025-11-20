import { kmod_bios_time_getTimestamp } from "../../kernel/modules/bios/time";

export function getDate(): Date {
  return new Date(kmod_bios_time_getTimestamp());
}
