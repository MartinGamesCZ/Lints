export function padStart(
  str: string,
  targetLength: number,
  padString: string
): string {
  while (str.length < targetLength) {
    str = padString + str;
  }

  return str;
}
