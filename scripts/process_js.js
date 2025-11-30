#!/usr/bin/env node
const fs = require("fs");

const script = fs.readFileSync("out/os/index.js", "utf-8");
const processed = script
  .replaceAll("let ", "var ")
  .replaceAll("const ", "var ")
  .replaceAll("\n`", "\\n`")
  .replaceAll("`", "'");

fs.writeFileSync(
  "out/embedded_js.h",
  `
  #ifndef EMBEDDED_JS_H
  #define EMBEDDED_JS_H
  const char *EMBEDDED_JS = "${processed
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")}";
  #endif`
);
