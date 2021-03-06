import { IAnimation, IAnimable, IAnimProp, IKeyframe, IAnimationControls } from "./AnimSpec";
import { mapRange, clamp } from "./utils";
import { IEase, detectEase } from "./Ease";
import { COLOR_PROPS } from "./Constants";
import { Color, colorFromString } from "./Color";

export class AnimationController implements IAnimation, IAnimationControls {

  selector : string;
  items : AnimableController[];
  duration : number;
  loop : boolean;
  loopTimes? : number;
  parentElm : HTMLElement;

  private startTime : number;
  private pausePlayhead : number;
  playing : boolean = false;

  constructor(anim : IAnimation) {
    this.selector = anim.selector;
    this.parentElm = document.querySelector(anim.selector) as HTMLElement;
    this.loop = anim.loop;
    this.duration = anim.duration;
    this.loopTimes = anim.loopTimes;
    this.items = anim.items.map((i) => new AnimableController(i, this));

    this.startTime = Date.now();

    this.pausePlayhead = undefined;

    console.log(`Bound animation for selector: ${this.parentElm}`);
  }
  /** Starts the animation from 0
   * @returns void
   */
  start() : void {
    this.startTime = Date.now();
    this.playing = true;
    this.draw();
  }

  private savePlayhead() : void {
      this.pausePlayhead = this.playhead;
  }

  get playhead() : number {
    if (this.playing) {
      return ( (Date.now() - this.startTime) % this.duration ) / this.duration;
    } else if (this.pausePlayhead !== undefined) {
      return this.pausePlayhead;
    } else {
      return 0;
    }
  }

  set playhead(n : number) {
    this.scrub(n);
  }

  /** Starts the animation without resetting
   * @returns void
   */
  resume() : number {
    if (this.pausePlayhead !== undefined) {
      console.log("Resuming from saved playhead");
      this.playhead = this.pausePlayhead;
      this.pausePlayhead = undefined;
    }

    this.playing = true;

    this.draw();
    return this.playhead;
  }

  stop() : number {
    this.playing = false;
    this.playhead = 0;
    return this.playhead;
  }

  pause() : number {
    this.savePlayhead();
    this.playing = false;
    return this.playhead;
  }

  private draw() : void {
    const pos = this.playhead;
    this.setAll(pos);
    if (this.playing) {
      requestAnimationFrame(() => this.draw());
    } else {
      console.log("Stopping draw loop");
    }
  }

  scrub(pos : number) : void {
    pos = clamp(pos, 0, 1);
    this.startTime = Date.now() - (this.duration * pos);
    if (!this.playing) {
      this.pausePlayhead = pos;
    }
  }

  setAll(pos : number) : void {
    // Set all elements to their current props based on KFs
    for (const item of this.items) {
      this.setOne(item, pos);
    }
  }

  private setOne(item : AnimableController, pos : number) {
    if (item.element !== null) {
      for (const prop of item.props) {
        prop.propertyObj.set(item.element, prop.getValueAt(pos));
      }
    } else {
      console.log(`Selector ${item.selector} not present in ${this.selector}`);
    }
  }
}

export class AnimableController implements IAnimable {
  selector : string;
  props : AnimPropController[];
  element : HTMLElement;

  constructor(animable : IAnimable, parent : AnimationController) {
    this.selector = animable.selector;
    this.props = animable.props.map((i) => new AnimPropController(i));
    this.element = parent.parentElm.querySelector(this.selector);
  }

}

export class PropertyObject {
  kind : string;
  key : string;
  valueType : string;

  constructor(propstring : string) {
    const parts = propstring.split(":");

    // Default is style
    if (parts.length === 1) {
      this.kind = "style";
      this.key = propstring;
    } else {
      switch (parts[0]) {
        case "style":
          this.kind = "style";
          this.key = parts[1];
          break;
        case "attr":
          this.kind = "attr";
          this.key = parts[1];
          break;
        case "text":
          this.kind = "text";
          this.key = "";
          break;
        default:
          throw new Error(`Unknown property kind ${parts[0]}`);
      }
    }

    if (this.kind === "style" && COLOR_PROPS.indexOf(this.key) !== -1) {
      this.valueType = "color";
    } else if (this.kind === "text") {
      this.valueType = "discrete";
    } else {
      this.valueType = "numeric";
    }
  }

  set(element : HTMLElement, value : string) {
    switch (this.kind) {
      case "attr":
        element.setAttribute(this.key, value);
        break;
      case "style":
        element.style[this.key as any] = value;
        break;
      case "text":
        element.innerText = value;
        break;
      default:
        throw new Error(`Unimplemented kind ${this.kind}`);
    }
  }
}

export class AnimPropController implements IAnimProp {
  property : string;
  private _keyframes : KeyframeController[];
  propertyObj : PropertyObject;
  unit : string;
  ease : string;
  easeObj : IEase;
  interpolation : string;
  private numberValues : boolean;
  private colorValues : boolean;

  constructor(prop : IAnimProp) {
    this.property = prop.property;
    this.propertyObj = new PropertyObject(this.property);

    this.colorValues = this.propertyObj.valueType === "color";

    this.keyframes = prop.keyframes
      .map((i) => new KeyframeController(i, this.colorValues));
    this.unit = (typeof prop.unit) === "undefined" ? "px" : prop.unit;

    this.numberValues = !this.keyframes.some((e) => typeof e.value === "string");
    this.colorValues = this.propertyObj.valueType === "color";

    this.ease = prop.ease;
    this.easeObj = detectEase(prop.ease);

    if (prop.interpolation) {
      this.interpolation = prop.interpolation;
    } else {
      if (this.colorValues) {
        this.interpolation = "hsl";
      } else {
        this.interpolation = "standard";
      }
    }
  }

  get keyframes() : KeyframeController[] {
    return this._keyframes;
  }

  set keyframes(kfs : KeyframeController[]) {
    this._keyframes = kfs
      .sort((a, b) => a.position - b.position);
  }

  private findLastNearestKfIdx(position) : number {
    // The nearest value is the last value in the array that is less than or equal to the keyframe
    let lastNearestKFidx : number;

    for (let i = 0; i < this.keyframes.length; i++) {
      const elm = this.keyframes[i];
      if (elm.position <= position) {
        lastNearestKFidx = i;
      }
    }

    return lastNearestKFidx;
  }

  getNumberValueAt(position : number) : number {
    // Find literal edge cases
    let earlyEase : IEase;
    if (this.keyframes[0].position >= position) {
      // Return and "interpolate" the first keyframe
      earlyEase = this.keyframes[0].easeObj ? this.keyframes[0].easeObj : this.easeObj;
      return earlyEase.do(this.keyframes[0].value as number,
        this.keyframes[this.keyframes.length - 1].value as number, 0);

    } else if (this.keyframes[this.keyframes.length - 1].position <= position) {
      earlyEase = this.keyframes[this.keyframes.length - 1].easeObj ?
        this.keyframes[this.keyframes.length - 1].easeObj : this.easeObj;
      return earlyEase.do(this.keyframes[0].value as number,
        this.keyframes[this.keyframes.length - 1].value as number, 1);
    }

    // Anything below here is not an edge case.

    // Find nearest value in array
    let lastNearestKF : KeyframeController;
    const lastNearestKFidx : number = this.findLastNearestKfIdx(position);

    lastNearestKF = this.keyframes[lastNearestKFidx];

    // Return exact match
    if (lastNearestKF.position === position) {
      return lastNearestKF.value as number;
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
    return targetEase.do(lastNearestKF.value as number, firstAfterKF.value as number, normalizedDist);
  }

  getColorValueAt(position : number) : Color {
    // Find literal edge cases
    let earlyEase : IEase;
    if (this.keyframes[0].position >= position) {
      // Return and "interpolate" the first keyframe
      earlyEase = this.keyframes[0].easeObj ? this.keyframes[0].easeObj : this.easeObj;
      if (this.interpolation === "hsl") {
        return (this.keyframes[0].value as Color)
          .lerpHsl(this.keyframes[this.keyframes.length - 1].value as Color,
            earlyEase.do(0, 1, 0));
      } else if (this.interpolation === "rgb") {
        return (this.keyframes[0].value as Color)
          .lerp(this.keyframes[this.keyframes.length - 1].value as Color,
            earlyEase.do(0, 1, 0));
      } else {
        throw new Error(`Unknown color interpolation: ${this.interpolation}`);
      }

    } else if (this.keyframes[this.keyframes.length - 1].position <= position) {
      earlyEase = this.keyframes[this.keyframes.length - 1].easeObj ?
        this.keyframes[this.keyframes.length - 1].easeObj : this.easeObj;
      if (this.interpolation === "hsl") {
        return (this.keyframes[0].value as Color)
          .lerpHsl(this.keyframes[this.keyframes.length - 1].value as Color,
            earlyEase.do(0, 1, 1));
      } else if (this.interpolation === "rgb") {
        return (this.keyframes[0].value as Color)
          .lerp(this.keyframes[this.keyframes.length - 1].value as Color,
            earlyEase.do(0, 1, 1));
      } else {
        throw new Error(`Unknown color interpolation: ${this.interpolation}`);
      }
    }

    // Anything below here is not an edge case.

    // Find nearest value in array
    let lastNearestKF : KeyframeController;
    const lastNearestKFidx : number = this.findLastNearestKfIdx(position);

    lastNearestKF = this.keyframes[lastNearestKFidx];

    // Return exact match
    if (lastNearestKF.position === position) {
      return lastNearestKF.value as Color;
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
    if (this.interpolation === "hsl") {
      return (lastNearestKF.value as Color)
        .lerpHsl(firstAfterKF.value as Color,
          targetEase.do(0, 1, normalizedDist));
    } else if (this.interpolation === "rgb") {
      return (lastNearestKF.value as Color)
        .lerp(firstAfterKF.value as Color,
          targetEase.do(0, 1, normalizedDist));
    } else {
      throw new Error(`Unknown color interpolation: ${this.interpolation}`);
    }
  }

  getValueAt(position : number) : string {
    if (this.colorValues) {
      return this.getColorValueAt(position).toString();
    } else if (this.numberValues) {
      return this.getNumberValueAt(position).toString() + this.unit;
    } else {
      return this.getStepValueAt(position) as string;
    }
  }

  getStepValueAt(position : number) : (string|number|Color) {
    return this.keyframes.filter((e) => e.position <= position).reverse()[0].value;
  }

}

export class KeyframeController implements IKeyframe {
  position : number;
  value : (string|number|Color);
  ease? : string;
  easeObj? : IEase;

  constructor(kf : IKeyframe, asColor : boolean) {
    this.position = kf.position;
    if (asColor) {
      this.value = colorFromString(kf.value as string);
    } else {
      this.value = kf.value;
    }
    this.ease = kf.ease;
    if (kf.ease) {
      this.easeObj = detectEase(kf.ease);
    }
  }
}
