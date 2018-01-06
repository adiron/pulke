import { mapRange } from "./utils";
import * as BezierEasing from "bezier-easing";

export interface Ease {
  do(v1 : number, v2 : number, p : number) : number;
}

export class LinearInterpolation implements Ease {
  do(v1: number, v2: number, p: number): number {
    p = p < 0 ? 0 : p;
    p = p > 1 ? 1 : p;
    return v1 + (v2 - v1) * p;
  }
}

export class FrozenInterpolation implements Ease {
  do(v1: number, v2: number, p: number): number {
    return v1;
  }
}

export class BezierInterpolation implements Ease {
  bezierFunction : (number) => number;
  constructor(x1:number, y1:number, x2:number, y2:number) {
    this.bezierFunction = BezierEasing(x1, y1, x2, y2);
  }
  do(v1: number, v2: number, p: number): number {
    const n = this.bezierFunction(p);
    return mapRange(n, 0, 1, v1, v2);
  }
}

// Filters

export class GranularFilter implements Ease {
  ease : Ease;
  granularity : number;
  constructor(ease : Ease, granularity : number) {
    this.granularity = granularity;
    this.ease = ease;
  }

  do(v1: number, v2: number, p: number): number {
    const v = this.ease.do(v1, v2, p);
    return Math.floor(v / this.granularity) * this.granularity;
  }
}

export class MapFilter implements Ease {
  ease : Ease;
  low1 : number;
  high1 : number;
  low2 : number;
  high2 : number;
  constructor(ease : Ease, low1 : number, high1 : number, low2 : number, high2 : number) {
    this.ease = ease;

    this.low1 = low1;
    this.high1 = high1;
    this.low2 = low2;
    this.high2 = high2;
  }

  do(v1: number, v2: number, p: number): number {
    const v = this.ease.do(v1, v2, p);
    return mapRange(v, this.low1, this.high1, this.low2, this.high2);
  }
}

function parseFilterOn(s : string, e : Ease) : Ease {
  const parts : string[] = s.split(/ +/);
  switch(parts[0]) {
    case "granular":
      return new GranularFilter(e, parseFloat(parts[1]));
    case "map":
      return new MapFilter(e, parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]));
    default:
      console.log(`Unknown filter: ${s}`);
      return e;
  }
}

export function detectEase(s : string) : Ease {
  if (!s || s == "linear") {
    return new LinearInterpolation();
  }

  const parts : string[] = s.split(':').map((e) => e.trim());
  const interpolationParams = parts.shift().split(/ +/);
  const interpolationName = interpolationParams.shift(); // Pop the head
  let baseObj : Ease;
  switch (interpolationName) {
    case "linear":
      baseObj = new LinearInterpolation();
      break;
    case "frozen":
      baseObj = new FrozenInterpolation();
      break;
    case "bezier":
      baseObj = new BezierInterpolation(parseFloat(interpolationParams[0]),
                                        parseFloat(interpolationParams[1]),
                                        parseFloat(interpolationParams[2]),
                                        parseFloat(interpolationParams[3]));
      break;
    default:
      console.log(`Unknown ease '${s}'. Defaulting to linear.`)
      return new LinearInterpolation();
  }

  // Parts is a tail with filters.

  for (let i = 0; i < parts.length; i++) {
    baseObj = parseFilterOn(parts[i], baseObj);
  }
  return baseObj;
}