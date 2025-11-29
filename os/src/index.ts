import { kmain } from "./kernel";
import { kpanic } from "./kernel/panic";

try {
  const res = kmain();

  if (res != 0) {
    kpanic("Kernel returned non-zero exit code");
  }
} catch (e) {
  kpanic(e instanceof Error ? e.message : String(e));
}
