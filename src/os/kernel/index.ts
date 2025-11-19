const SCREEN_WIDTH = 80;
const SCREEN_HEIGHT = 25;
const VIDEO_MEMORY_START = 0xb8000;

clearScreen();
print("Welcome to Lints OS!", 0, 0, 0x0a); // Light green on black

function clearScreen(): void {
  for (var row = 0; row < SCREEN_HEIGHT; row++) {
    for (var col = 0; col < SCREEN_WIDTH; col++) {
      const address = VIDEO_MEMORY_START + 2 * (row * SCREEN_WIDTH + col);
      writeMemory(address, 0x20); // ASCII space
      writeMemory(address + 1, 0x07); // Light grey on black
    }
  }
}

function writeChar(
  row: number,
  col: number,
  char: string,
  color: number
): void {
  const address = VIDEO_MEMORY_START + 2 * (row * SCREEN_WIDTH + col);
  writeMemory(address, char.charCodeAt(0));
  writeMemory(address + 1, color);
}

function print(text: string, row: number, col: number, color: number): void {
  for (var i = 0; i < text.length; i++) {
    writeChar(row, col + i, text[i]!, color);
  }
}
