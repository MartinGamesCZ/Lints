#!/usr/bin/env python3
"""
Embed JavaScript file as a C string constant
"""

import sys


def escape_c_string(s):
    """Escape a string for use in C source code"""
    result = []
    for char in s:
        if char == "\n":
            result.append("\\n")
        elif char == "\r":
            result.append("\\r")
        elif char == "\t":
            result.append("\\t")
        elif char == "\\":
            result.append("\\\\")
        elif char == '"':
            result.append('\\"')
        elif ord(char) < 32 or ord(char) > 126:
            result.append(f"\\x{ord(char):02x}")
        else:
            result.append(char)
    return "".join(result)


def main():
    if len(sys.argv) != 2:
        print("Usage: embed_js.py <input.js>", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]

    try:
        with open(input_file, "r") as f:
            js_code = f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {input_file}", file=sys.stderr)
        sys.exit(1)

    # Generate C header file
    print("/* Auto-generated file - do not edit */")
    print("#ifndef EMBEDDED_JS_H")
    print("#define EMBEDDED_JS_H")
    print()

    escaped = escape_c_string(js_code)
    print(f'const char *embedded_js_code = "{escaped}";')

    print()
    print("#endif /* EMBEDDED_JS_H */")


if __name__ == "__main__":
    main()
