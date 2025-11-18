clearScreen();
print("Hello World!");

// writeMemory(0xb8000, 0x48);
// writeMemory(0xb8001, 0x0f);

// writeMemory(0xb8002, 0x65);
// writeMemory(0xb8003, 0x0f);

// writeMemory(0xb8004, 0x6c);
// writeMemory(0xb8005, 0x0f);

// writeMemory(0xb8006, 0x6c);
// writeMemory(0xb8007, 0x0f);

// writeMemory(0xb8008, 0x6f);
// writeMemory(0xb8009, 0x0f);

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
