// Data specs
export interface Animation {
  selector: string;
  items: Animable[];
  duration: number;
  loop: boolean;
  loopTimes?: number;
}

export interface Animable {
  selector: string;
  props: AnimProp[];
}

export interface AnimProp {
  property: string;
  keyframes: Keyframe[];
  unit?: string;
  ease?: string;
}

export interface Keyframe {
  position: number;
  value: number;
  ease?: string
}