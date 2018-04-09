import { AnimationController } from "./Controllers";
import { Animation, AnimationControls } from "./AnimSpec";


// This is the main class
export class Pulke implements AnimationControls {
  private startTime: number;
  private lastTime: number;
  private animations: AnimationController[] = [];


  constructor(anim?: Animation) {
    if (anim) {
      this.load(anim);
    }
  }

  get playhead() : number {
    return this.animations.map(e => e.playhead).reduce((a,b) => a+b) / this.animations.length;
  }

  set playhead(n : number) {
    this.scrub(n);
  }

  scrub(position: number): void {
    this.animations.forEach((e)=> e.scrub(position));
  }

  load(anim: Animation): AnimationController {
    var c = new AnimationController(anim)
    this.animations.push(c);
    return c;
  }

  start(): void {
    this.animations.forEach((e)=> e.start());
  }

  resume(): number[] {
    return this.animations.map((e)=> e.resume());
  }

  pause(): number[] {
    return this.animations.map((e)=> e.pause());
  }
  
  stop(): number[] {
    return this.animations.map((e)=> e.stop());
  }

  get playing() : boolean {
    return (this.animations.some(a => a.playing)); 
  }
}
