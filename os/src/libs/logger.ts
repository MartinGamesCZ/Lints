import { kmod_console_outputString } from "../kernel/modules/console/console.kmod";

export const Logger = {
  log: function (message: string) {
    kmod_console_outputString(message + "\\r\\n");
  },
};
