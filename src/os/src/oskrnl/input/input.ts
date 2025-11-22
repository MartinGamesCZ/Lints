import { kmod_terminal_input_onKeyboardInput } from "../../kernel/modules/terminal/input";

export function oskrnl_input_onKeyPress(handler: (key: string) => void) {
  kmod_terminal_input_onKeyboardInput(handler);
}
