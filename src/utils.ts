export function mapRange(value:number, low1:number, high1:number, low2:number, high2:number) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function paddedHex(value: number) : string {
  let s = value.toString(16);
  return s.length >= 2 ? s : "0" + s;
}

export function clamp(value:number, min:number, max:number) {
  return Math.min(Math.max(value, min), max);
}
