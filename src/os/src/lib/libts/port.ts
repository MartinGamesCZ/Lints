export function portin(port: number): number {
  return $ptin(port);
}

export function portout(port: number, value: number): void {
  $ptout(port, value);
}
