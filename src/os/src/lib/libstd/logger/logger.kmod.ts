import { charc } from "../../libts/byte";
import { kdriver_etc_serial_transmit } from "../../../kernel/drivers/etc/serial";

export const Logger = {
  log(message: string) {
    for (let i = 0; i < message.length; i++) {
      kdriver_etc_serial_transmit(charc(message[i]!));
    }

    kdriver_etc_serial_transmit(charc("\n"));
  },
};
