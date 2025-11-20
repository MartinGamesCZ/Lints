import { Logger } from "../../../lib/libstd/logger/logger.kmod";
import type { KInterrupt, KInterruptHandler } from "../../../types/interrupt";

const kmod_cpu_irq_data: KInterrupt[] = [];

export function kmod_cpu_irq_register(
  irq: number,
  handler: KInterruptHandler,
  data: unknown
): boolean {
  if (kmod_cpu_irq_data[irq]) {
    Logger.log("[IRQ] IRQ " + irq + " is already registered.");
    return false;
  }

  if (irq > 15) {
    Logger.log("[IRQ] IRQ " + irq + " is out of bounds.");
    return false;
  }

  kmod_cpu_irq_data[irq] = {
    handler: handler,
    data: data,
  };

  function wrapper(irqNum: number) {
    const irqData = kmod_cpu_irq_data[irqNum];
    if (irqData) {
      irqData.handler(irqNum, irqData.data);
    }
  }

  const success = $irqregister(irq, wrapper);

  if (!success) {
    Logger.log("[IRQ] Failed to register IRQ " + irq + " with hardware.");
    delete kmod_cpu_irq_data[irq];
    return false;
  }

  Logger.log("[IRQ] Successfully registered IRQ " + irq);
  return true;
}
