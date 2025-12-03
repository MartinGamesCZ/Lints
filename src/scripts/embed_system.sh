#!/bin/bash
set -e

echo "#ifndef SYSTEM_PROG_H" > out/system/system_prog.h
echo "#define SYSTEM_PROG_H" >> out/system/system_prog.h
echo "const char* SYSTEM_PROG_JS = \\" >> out/system/system_prog.h

remove_mode=false
while IFS= read -r line; do
  if [ "$remove_mode" = true ]; then
    remove_mode=false
    continue
  fi

  ESCAPED_LINE=$(echo "$line" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')

  if echo "$line" | grep -q "___remove_next_line"; then
    remove_mode=true
    continue
  fi

  echo "\"${ESCAPED_LINE}\\n\"" >> out/system/system_prog.h

done < out/system/__.js

echo ";" >> out/system/system_prog.h

echo "#endif" >> out/system/system_prog.h