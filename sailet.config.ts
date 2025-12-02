// sailet.config.ts

import { script, step, cmd, $ } from "sailet";

script("build", () => [
  step("Build core", () => [cmd($`./src/scripts/build_core.sh`)]),
  step("Build ISO", () => [cmd($`./src/scripts/build_iso.sh`)]),
]);

script("vbox", () => [
  step("Build", () => [cmd($`st run build`)]),
  step("Run", () => [cmd($`./src/scripts/run_vbox.sh`)]),
]);
