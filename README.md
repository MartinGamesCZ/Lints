# Lints

## What the hell is this?

Lints is an experimental operating system kernel written almost entirely in TypeScript. This is not some in-browser system emulator or WebAssembly hack; Lints actually runs on real hardware (or a hardware emulator like QEMU) by leveraging a JavaScript engine with a small C kernel (just some basic memory management needed by the JS engine) and JS-to-C bindings for purposes like writting data to pointers, etc.

## Why?

- I can.
- I want to be able to say that I did it.
- I am not sane and don't have a life.
- TypeScript haters.
- "Anything that can be done in JavaScript will eventually be done in JavaScript." - Jeff Atwood

## How to run it?

Please don't.

If you really want to, make sure you have Docker installed, then run:

```bash
./scripts/run-kernel.sh
```

## If you are an employer looking at this...

I would appreciate if you messaged me and gave me some well-paid job. Also...
Please don't judge me based on this project. I swear I can write normal code too.

## License

MIT License. See LICENSE file for details.

TL;DR: Do whatever you want with it, but don't blame me if it blows up in your face. Also I'd appreciate that you give me credit if you use any of my code, ideas or whatever - I mean why would someone even want to be associated with this project (or steal it), right?
