// Data specs

export interface IAnimationControls {
  start();
  resume();
  stop();
  playhead : number;
  scrub(number);
}

export interface IAnimation {
  selector : string;
  items : IAnimable[];
  duration : number;
  loop : boolean;
  loopTimes? : number;
}

export interface IAnimable {
  selector : string;
  props : IAnimProp[];
}

export interface IAnimProp {
  property : string;
  keyframes : IKeyframe[];
  unit? : string;
  ease? : string;
}

export interface IKeyframe {
  position : number;
  value : (number|string);
  ease? : string;
}
