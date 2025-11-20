import type { Keycode } from "../../../config/keyboard";

const kmod_terminal_input_keyboardInputHandlers: Array<
  (keycode: keyof typeof Keycode) => void
> = [];

export function kmod_terminal_input_init(): void {}

export function kmod_terminal_input_onKeyboardInput(
  handler: (keycode: keyof typeof Keycode) => void
) {
  kmod_terminal_input_keyboardInputHandlers.push(handler);
}

export function kmod_terminal_input_handleKeyboardInput(
  keycode: keyof typeof Keycode
): void {
  for (let i = 0; i < kmod_terminal_input_keyboardInputHandlers.length; i++) {
    kmod_terminal_input_keyboardInputHandlers[i]!(keycode);
  }
}
