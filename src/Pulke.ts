import { Animation, Animable, getValueAt } from "./AnimSpec";

// This is the main class
export class Pulke {
  private startTime: number;
  private lastTime: number;
  private bound: boolean = false;
  private animations: AnimationController[] = [];


  constructor(anim?: Animation) {
    if (anim) {
      this.load(anim);
    }
  }

  scrubAll(position: number): void {

  }

  load(anim: Animation): AnimationController {
    var c = new AnimationController(anim)
    this.animations.push(c);
    return c;
  }

  bind(): void {
    this.bound = true;
  }
}

class AnimationController {
  private anim: Animation;
  private parentElm: HTMLElement;

  playing : boolean = false;

  get duration() : number { return this.anim.duration; }
  set duration(n : number) { this.anim.duration = n; }

  get loopTimes() : number { return this.anim.loopTimes; }
  set loopTimes(n : number) { this.anim.loopTimes = n; }

  get loop() : boolean { return this.anim.loop }
  set loop(n : boolean) { this.anim.loop = n }

  play() : void {
    this.playing = true;
  }

  scrub(pos : number) {

  }

  constructor(anim: Animation) {
    this.anim = anim;
    this.parentElm = document.querySelector(anim.selector);
  }

  setAll(pos : number): void {
    // Set all elements to their current props based on KFs
    for (let index = 0; index < this.anim.items.length; index++) {
      const item = this.anim.items[index];
      this.set(item, pos);
    }
  }


  private set(item: Animable, pos: number) {
    const itemElem: HTMLElement = this.parentElm.querySelector(item.selector);
    const a = new SVGElement();
    for (let propIndex = 0; propIndex < item.props.length; propIndex++) {
      const prop = item.props[propIndex];
      itemElem.style[prop.property] = getValueAt(pos, prop);
    }
  }
}