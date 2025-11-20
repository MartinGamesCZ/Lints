export function bytein(port: number): number {
  return $bytein(port);
}

export function byteout(port: number, value: number): void {
  $byteout(port, value);
}

export function charc(char: string): number {
  return char.charCodeAt(0);
}
