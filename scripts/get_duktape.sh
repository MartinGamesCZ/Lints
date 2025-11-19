#!/bin/bash
# Script to download Duktape library if not present

set -e

DUKTAPE_DIR="lib/duktape"
DUKTAPE_REPO="https://github.com/joeqread/arduino-duktape.git"
TEMP_DIR="lib/temp_duktape"

echo "=== Checking for Duktape library ==="

if [ -d "$DUKTAPE_DIR" ]; then
  echo "Duktape already exists at $DUKTAPE_DIR"
else
  echo "Duktape not found. Cloning from $DUKTAPE_REPO..."
  git clone "$DUKTAPE_REPO" "$TEMP_DIR"
  
  echo "Extracting src folder..."
  mkdir -p "$DUKTAPE_DIR"
  mv "$TEMP_DIR/src" "$DUKTAPE_DIR/"
  
  echo "Cleaning up temporary directory..."
  rm -rf "$TEMP_DIR"
  
  echo "Duktape cloned successfully!"
fi

echo "Done."