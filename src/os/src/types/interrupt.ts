export type KInterruptHandler = (
  interruptNumber: number,
  data?: unknown
) => void;

export type KInterrupt = {
  handler: KInterruptHandler;
  data: unknown;
};
