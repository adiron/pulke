import { Animation, Animable, AnimProp, Keyframe } from "./AnimSpec";
import { Ease } from "./Ease";
export declare class AnimationController implements Animation {
    selector: string;
    items: AnimableController[];
    duration: number;
    loop: boolean;
    loopTimes?: number;
    private parentElm;
    startTime: number;
    private pausePlayhead;
    playing: boolean;
    constructor(anim: Animation);
    /** Starts the animation from 0
     * @returns void
     */
    start(): void;
    private savePlayhead();
    playhead: number;
    /** Starts the animation without resetting
     * @returns void
     */
    resume(): number;
    stop(): number;
    pause(): number;
    draw(): void;
    scrub(pos: number): void;
    setAll(pos: number): void;
    private setOne(item, pos);
}
export declare class AnimableController implements Animable {
    selector: string;
    props: AnimPropController[];
    constructor(animable: Animable);
}
export declare class PropertyObject {
    kind: string;
    key: string;
    constructor(propstring: string);
    set(element: HTMLElement, value: string): void;
}
export declare class AnimPropController implements AnimProp {
    property: string;
    private _keyframes;
    propertyObj: PropertyObject;
    unit: string;
    ease: string;
    easeObj: Ease;
    constructor(prop: AnimProp);
    keyframes: KeyframeController[];
    getNumberValueAt(position: number): number;
    getValueAt(position: number): string;
}
export declare class KeyframeController implements Keyframe {
    position: number;
    value: number;
    ease?: string;
    easeObj?: Ease;
    constructor(kf: Keyframe);
}
