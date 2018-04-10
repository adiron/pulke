import { mapRange } from "./utils";
import * as BezierEasing from "bezier-easing";

export interface IEase {
  do(v1 : number, v2 : number, p : number) : number;
}

export class LinearInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    p = p < 0 ? 0 : p;
    p = p > 1 ? 1 : p;
    return v1 + (v2 - v1) * p;
  }
}

export class EaseInQuadInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(p * p, 0, 1, v1, v2);
  }
}

export class EaseOutQuadInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(p * (2 - p), 0, 1, v1, v2);
  }
}

export class EaseInOutQuadInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(p < .5 ? 2 * p * p : -1 + (4 - 2 * p) * p, 0, 1, v1, v2);
  }
}

export class EaseInCubicInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(p * p * p, 0, 1, v1, v2);
  }
}

export class EaseOutCubicInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange((--p) * p * p + 1, 0, 1, v1, v2);
  }
}

export class EaseInOutCubicInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(p < .5 ? 4 * p * p * p : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1, 0, 1, v1, v2);
  }
}

export class EaseInQuartInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(p * p * p * p, 0, 1, v1, v2);
  }
}

export class EaseOutQuartInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(1 - (--p) * p * p * p, 0, 1, v1, v2);
  }
}

export class EaseInOutQuartInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return mapRange(p < .5 ? 8 * p * p * p * p : 1 - 8 * (--p) * p * p * p, 0, 1, v1, v2);
  }
}

export class FrozenInterpolation implements IEase {
  do(v1 : number, v2 : number, p : number) : number {
    return v1;
  }
}

export class BezierInterpolation implements IEase {
  bezierFunction : (n : number) => number;
  constructor(x1 : number, y1 : number, x2 : number, y2 : number) {
    this.bezierFunction = BezierEasing(x1, y1, x2, y2);
  }
  do(v1 : number, v2 : number, p : number) : number {
    const n = this.bezierFunction(p);
    return mapRange(n, 0, 1, v1, v2);
  }
}

// Filters

export class GranularFilter implements IEase {
  ease : IEase;
  granularity : number;
  constructor(ease : IEase, granularity : number) {
    this.granularity = granularity;
    this.ease = ease;
  }

  do(v1 : number, v2 : number, p : number) : number {
    const v = this.ease.do(v1, v2, p);
    return Math.floor(v / this.granularity) * this.granularity;
  }
}

export class MapFilter implements IEase {
  ease : IEase;
  low1 : number;
  high1 : number;
  low2 : number;
  high2 : number;
  constructor(ease : IEase, low1 : number, high1 : number, low2 : number, high2 : number) {
    this.ease = ease;

    this.low1 = low1;
    this.high1 = high1;
    this.low2 = low2;
    this.high2 = high2;
  }

  do(v1 : number, v2 : number, p : number) : number {
    const v = this.ease.do(v1, v2, p);
    return mapRange(v, this.low1, this.high1, this.low2, this.high2);
  }
}

function parseFilterOn(s : string, e : IEase) : IEase {
  const parts : string[] = s.split(/ +/);
  switch (parts[0]) {
    case "granular":
      return new GranularFilter(e, parseFloat(parts[1]));
    case "map":
      return new MapFilter(e, parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]));
    default:
      console.log(`Unknown filter: ${s}`);
      return e;
  }
}

export function detectEase(s : string) : IEase {
  if (!s || s === "linear") {
    return new LinearInterpolation();
  }

  const parts : string[] = s.split(":").map((e) => e.trim());
  const interpolationParams = parts.shift().split(/ +/);
  const interpolationName = interpolationParams.shift(); // Pop the head
  let baseObj : IEase;
  switch (interpolationName) {
    case "linear":
      baseObj = new LinearInterpolation();
      break;
    case "in-quad":
      baseObj = new EaseInQuadInterpolation();
      break;
    case "out-quad":
      baseObj = new EaseOutQuadInterpolation();
      break;
    case "in-out-quad":
      baseObj = new EaseInOutQuadInterpolation();
      break;
    case "in-cubic":
      baseObj = new EaseInCubicInterpolation();
      break;
    case "out-cubic":
      baseObj = new EaseOutCubicInterpolation();
      break;
    case "in-out-cubic":
      baseObj = new EaseInOutCubicInterpolation();
      break;
    case "in-quart":
      baseObj = new EaseInQuartInterpolation();
      break;
    case "out-quart":
      baseObj = new EaseOutQuartInterpolation();
      break;
    case "in-out-quart":
      baseObj = new EaseInOutQuartInterpolation();
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
      console.log(`Unknown ease '${s}'. Defaulting to linear.`);
      return new LinearInterpolation();
  }

  // Parts is a tail with filters.

  for (const part of parts) {
    baseObj = parseFilterOn(part, baseObj);
  }
  return baseObj;
}
