import { AnimationController } from "./Controllers";
import { Animation } from "./AnimSpec";
export declare class Pulke {
    private startTime;
    private lastTime;
    private bound;
    private animations;
    constructor(anim?: Animation);
    scrub(position: number): void;
    load(anim: Animation): AnimationController;
    bind(): void;
    start(): void;
    resume(): number[];
    pause(): number[];
    stop(): number[];
    readonly playing: boolean;
}
