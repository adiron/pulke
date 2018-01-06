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

export class GranularizeInterpolation implements Ease {
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

function parseFilterOn(s : string, e : Ease) : Ease {
  const parts : string[] = s.split(/ +/);
  switch(parts[0]) {
    case "granular":
      return new GranularizeInterpolation(e, parseInt(parts[1]));
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
  const interpolationName = parts.shift(); // Pop the head
  let baseObj : Ease;
  switch (interpolationName) {
    case "linear":
      baseObj = new LinearInterpolation();
      break;
    case "frozen":
      baseObj = new FrozenInterpolation();
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