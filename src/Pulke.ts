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
