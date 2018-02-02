import { AnimationController } from "./Controllers";
import { Animation } from "./AnimSpec";


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

  scrub(position: number): void {
    this.animations.forEach((e)=> e.scrub(position));
  }

  load(anim: Animation): AnimationController {
    var c = new AnimationController(anim)
    this.animations.push(c);
    return c;
  }

  bind(): void {
    this.bound = true;
  }

  start(): void {
    this.animations.forEach((e)=> e.start());
  }

  resume(): void {
    this.animations.forEach((e)=> e.resume());
  }
  
  stop(): number[] {
    return this.animations.map((e)=> e.stop());
  }
}
