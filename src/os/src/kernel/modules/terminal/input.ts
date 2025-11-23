import type { Keycode } from "../../../config/keyboard";

const kmod_terminal_input_keyboardInputHandlers: Array<
  (keycode: keyof typeof Keycode) => void
> = [];

export function kmod_terminal_input_init(): void {}

export function kmod_terminal_input_onKeyboardInput(
  handler: (keycode: keyof typeof Keycode) => void
): () => void {
  kmod_terminal_input_keyboardInputHandlers.push(handler);

  return function () {
    const index = kmod_terminal_input_keyboardInputHandlers.indexOf(handler);
    if (index !== -1) {
      kmod_terminal_input_keyboardInputHandlers.splice(index, 1);
    }
  };
}

export function kmod_terminal_input_handleKeyboardInput(
  keycode: keyof typeof Keycode
): void {
  for (let i = 0; i < kmod_terminal_input_keyboardInputHandlers.length; i++) {
    kmod_terminal_input_keyboardInputHandlers[i]!(keycode);
  }
}
