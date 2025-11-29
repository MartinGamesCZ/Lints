# Build TypeScript to JavaScript
cd os
echo "Compiling TypeScript to JavaScript..."
bun build --outdir ../out/os --target node --bundle src/index.ts
cd ..

./scripts/process_js.js
