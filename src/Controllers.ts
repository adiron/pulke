import { Animation, Animable, AnimProp, Keyframe } from "./AnimSpec";
import { mapRange } from "./utils";
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
    console.log(`Bound animation for selector: ${this.parentElm}`)

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
      prop.propertyObj.set(itemElem, prop.getValueAt(pos));
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

class PropertyObject {
  kind : string;
  key : string;
  constructor(propstring: string) {
    const parts = propstring.split(":")

    // Default is style
    if (parts.length === 1) {
      this.kind = "style";
      this.key = propstring;
    } else {
      switch (parts[0]) {
        case "style":
          this.kind = "style"
          this.key = parts[1];
          break;
        case "attr":
          this.kind = "attr"
          this.key = parts[1];
          break;
        default:
          throw new Error(`Unknown property kind ${parts[0]}`)
      }
    }
  }

  set(element: HTMLElement, value : string) {
    switch (this.kind) {
      case "attr":
        element.setAttribute(this.key, value);
        break;
      case "style":
        element.style[<any>this.key] = value;
    }
  }
}

export class AnimPropController implements AnimProp {
  property: string;
  private _keyframes: KeyframeController[];
  propertyObj: PropertyObject;
  unit: string;
  ease: string;
  easeObj : Ease;

  constructor(prop : AnimProp) {
    this.property = prop.property;
    this.propertyObj = new PropertyObject(this.property);

    this.keyframes = prop.keyframes
      .map((i) => new KeyframeController(i))
    this.unit = (typeof prop.unit) == 'undefined' ? "px" : prop.unit;

    this.ease = prop.ease;
    this.easeObj = detectEase(prop.ease);
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
    let earlyEase : Ease;
    if (this.keyframes[0].position >= position) {
      // Return and "interpolate" the first keyframe
      earlyEase = this.keyframes[0].easeObj ? this.keyframes[0].easeObj : this.easeObj;
      return earlyEase.do(this.keyframes[0].value, this.keyframes[this.keyframes.length - 1].value, 0);
 
    } else if (this.keyframes[this.keyframes.length - 1].position <= position) {
      earlyEase = this.keyframes[this.keyframes.length - 1].easeObj ? this.keyframes[this.keyframes.length - 1].easeObj : this.easeObj;
      return earlyEase.do(this.keyframes[0].value, this.keyframes[this.keyframes.length - 1].value, 1);
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

    // Pick an ease function
    const targetEase = lastNearestKF.easeObj ? lastNearestKF.easeObj : this.easeObj;
    return targetEase.do(lastNearestKF.value, firstAfterKF.value, normalizedDist)
  }

  getValueAt(position: number): string {
    return this.getNumberValueAt(position).toString() + this.unit;
  }

}

export class KeyframeController implements Keyframe {
  position: number;
  value: number;
  ease?: string;
  easeObj?: Ease;
  
  constructor(kf : Keyframe) {
    this.position = kf.position;
    this.value = kf.value;
    this.ease = kf.ease;
    if (kf.ease) {
      this.easeObj = detectEase(kf.ease);
    }
  }
}