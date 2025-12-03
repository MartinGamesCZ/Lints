#!/bin/bash
set -e

mkdir -p out
mkdir -p out/system

bun build --outdir out/system src/system/src/index.ts