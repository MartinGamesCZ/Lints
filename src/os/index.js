clearScreen();
print("Hello, World!");

function clearScreen() {
  var i = 0;
  while (i < 80 * 25 * 2) {
    writeMemory(0xb8000 + i, 0x00);
    i++;
  }
}

function printChar(char, offset) {
  writeMemory(0xb8000 + offset * 2, char.charCodeAt(0));
  writeMemory(0xb8000 + offset * 2 + 1, 0x0f); // White on black
}

function print(str) {
  for (var i = 0; i < str.length; i++) {
    printChar(str.charAt(i), i);
  }
}
