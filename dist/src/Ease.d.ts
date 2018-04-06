export interface Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class LinearInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseInQuadInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseOutQuadInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseInOutQuadInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseInCubicInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseOutCubicInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseInOutCubicInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseInQuartInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseOutQuartInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class EaseInOutQuartInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class FrozenInterpolation implements Ease {
    do(v1: number, v2: number, p: number): number;
}
export declare class BezierInterpolation implements Ease {
    bezierFunction: (n: number) => number;
    constructor(x1: number, y1: number, x2: number, y2: number);
    do(v1: number, v2: number, p: number): number;
}
export declare class GranularFilter implements Ease {
    ease: Ease;
    granularity: number;
    constructor(ease: Ease, granularity: number);
    do(v1: number, v2: number, p: number): number;
}
export declare class MapFilter implements Ease {
    ease: Ease;
    low1: number;
    high1: number;
    low2: number;
    high2: number;
    constructor(ease: Ease, low1: number, high1: number, low2: number, high2: number);
    do(v1: number, v2: number, p: number): number;
}
export declare function detectEase(s: string): Ease;
