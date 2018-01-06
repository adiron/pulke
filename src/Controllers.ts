import { Animation, Animable, AnimProp, Keyframe } from "./AnimSpec";
import { mapRange, lerp } from "./utils";
import { Ease, detectEase } from "./Ease";

export class AnimationController implements Animation {

  selector: string;
  items: AnimableController[];
  duration: number;
  loop: boolean;
  loopTimes?: number;
  private parentElm: HTMLElement;

  playing : boolean = false;

  constructor(anim: Animation) {
    this.selector = anim.selector;
    this.parentElm = <HTMLElement>document.querySelector(anim.selector);
    this.loop = anim.loop;
    this.duration = anim.duration;
    this.loopTimes = anim.loopTimes;
    this.items = anim.items.map((i) => new AnimableController(i));

  }

  play() : void {
    this.playing = true;
    this.draw();
  }

  draw() : void {
    const pos = ( Date.now() % this.duration ) / this.duration;
    this.setAll(pos);
    if (this.playing) {
      requestAnimationFrame(() => this.draw());
    } else {
      console.log("Stopping")
    }
  }

  scrub(pos : number) {

  }

  setAll(pos : number): void {
    // Set all elements to their current props based on KFs
    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      this.setOne(item, pos);
    }
  }


  private setOne(item: AnimableController, pos: number) {
    const itemElem: HTMLElement = this.parentElm.querySelector(item.selector);
    for (let propIndex = 0; propIndex < item.props.length; propIndex++) {
      const prop : AnimPropController = item.props[propIndex];
      itemElem.style[prop.property] = prop.getValueAt(pos);
      itemElem.innerText = prop.getValueAt(pos);
    }
  }
}

export class AnimableController implements Animable {
  selector: string;
  props: AnimPropController[];

  constructor(animable : Animable) {
    this.selector = animable.selector;
    this.props = animable.props.map((i) => new AnimPropController(i));
  }

}

export class AnimPropController implements AnimProp {
  property: string;
  private _keyframes: KeyframeController[];
  unit: string;

  constructor(prop : AnimProp) {
    this.property = prop.property;
    this.keyframes = prop.keyframes
      .map((i) => new KeyframeController(i))
    this.unit = prop.unit || "px";
  }

  get keyframes() : KeyframeController[] {
    return this._keyframes;
  }

  set keyframes(kfs : KeyframeController[]) {
    this._keyframes = kfs
      .sort((a,b) => a.position - b.position);
  }

  getNumberValueAt(position: number): number {
    // Find literal edge cases
    if (this.keyframes[0].position >= position) {
      return this.keyframes[0].value;
    } else if (this.keyframes[this.keyframes.length - 1].position <= position) {
      return this.keyframes[this.keyframes.length - 1].value;
    }

    // Anything below here is not an edge case.

    // Find nearest value in array
    // The nearest value is the last value in the array that is less than or equal to the keyframe
    let lastNearestKF: KeyframeController;
    let lastNearestKFidx: number;

    for (let i = 0; i < this.keyframes.length; i++) {
      const elm = this.keyframes[i];
      if (elm.position <= position) {
        lastNearestKFidx = i;
      }
    }

    lastNearestKF = this.keyframes[lastNearestKFidx];

    // Return exact match
    if (lastNearestKF.position == position) {
      return lastNearestKF.value;
    }

    // Match exists somewhere in between two KFs!

    // Which is the higher?
    const firstAfterKF = this.keyframes[lastNearestKFidx + 1];

    // The total distance between the two KFs
    const distance = firstAfterKF.position - lastNearestKF.position;
    // The distance AWAY from the lower bound
    const distanceInto = position - lastNearestKF.position;
    // Normalized distance
    const normalizedDist = mapRange(distanceInto, 0, distance, 0, 1);

    // TODO - add other kinds of interpolation and control exactly how they work
    return lastNearestKF.easeObj.do(lastNearestKF.value, firstAfterKF.value, normalizedDist)
  }

  getValueAt(position: number): string {
    return this.getNumberValueAt(position).toString() + this.unit;
  }

}

export class KeyframeController implements Keyframe {
  position: number;
  value: number;
  ease?: string;
  easeObj: Ease;
  
  constructor(kf : Keyframe) {
    this.position = kf.position;
    this.value = kf.value;
    this.ease = kf.ease;
    this.easeObj = detectEase(kf.ease);
  }
}