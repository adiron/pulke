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

  play(): void {
    this.animations.forEach((e)=> e.play());
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

  constructor(anim: Animation) {
    this.anim = anim;
    this.parentElm = <HTMLElement>document.querySelector(anim.selector);
  }

  setAll(pos : number): void {
    // Set all elements to their current props based on KFs
    for (let index = 0; index < this.anim.items.length; index++) {
      const item = this.anim.items[index];
      this.setOne(item, pos);
    }
  }


  private setOne(item: Animable, pos: number) {
    const itemElem: HTMLElement = <HTMLElement>this.parentElm.querySelector(item.selector);
    for (let propIndex = 0; propIndex < item.props.length; propIndex++) {
      const prop = item.props[propIndex];
      itemElem.style[prop.property] = getValueAt(pos, prop);
      itemElem.innerText = getValueAt(pos, prop).toString();
    }
  }
}