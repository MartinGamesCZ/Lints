export function uiarrtostr(a: number[]) {
  let s = "";

  for (let i = 0; i < a.length; i++) {
    s += String.fromCharCode(a[i]!);
  }

  return s;
}