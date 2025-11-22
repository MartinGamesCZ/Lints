import { Logger } from "../../lib/libstd/logger/logger.kmod";

export function oskrnl_console_log(data: any) {
  Logger.log(String(data));
}

export function oskrnl_console_update(data: any) {
  Logger.update(String(data));
}
