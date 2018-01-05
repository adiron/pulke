// Linearly interpolate two numbers
export function lerp(v1 :number, v2 :number, p :number) {
  p = p < 0 ? 0 : p;
  p = p > 1 ? 1 : p;
  return v1 + (v2 - v1) * p;
}

export function mapRange(value:number, low1:number, high1:number, low2:number, high2:number) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}