import { kmain } from "./kernel";
import { kpanic } from "./kernel/panic";

try {
  kmain();
} catch (e) {
  kpanic(e instanceof Error ? e.message : String(e));
}
