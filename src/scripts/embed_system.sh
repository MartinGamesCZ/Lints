#!/bin/bash
set -e

echo "#ifndef SYSTEM_PROG_H" > out/system/system_prog.h
echo "#define SYSTEM_PROG_H" >> out/system/system_prog.h
echo "const char* SYSTEM_PROG_JS = \\" >> out/system/system_prog.h
while IFS= read -r line; do
  ESCAPED_LINE=$(echo "$line" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
  echo "\"${ESCAPED_LINE}\\n\"" >> out/system/system_prog.h
done < out/system/index.js
echo ";" >> out/system/system_prog.h
echo "#endif" >> out/system/system_prog.h