#! /usr/bin/env bun
import { readFileSync, writeFileSync } from "fs";

writeFileSync(
  "build/index.js",
  readFileSync("build/index.js", "utf-8")
    .replaceAll("let ", "var ")
    .replaceAll("const ", "var ")
    .replaceAll("\n`", "\\n`")
    .replaceAll("`", "'")
);
