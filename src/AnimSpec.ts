import { lerp, mapRange } from "./utils";

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
}

export interface Keyframe {
  position: number;
  value: number;
}

export function getValueAt(position: number, prop: AnimProp): number {
  const sortedKeys = prop.keyframes.sort((a, b) => a.position - b.position);

  // Find literal edge cases
  if (sortedKeys[0].position >= position) {
    return sortedKeys[0].value;
  } else if (sortedKeys[sortedKeys.length - 1].position <= position) {
    return sortedKeys[sortedKeys.length - 1].value;
  }

  // Anything below here is not an edge case.

  // Find nearest value in array
  // The nearest value is the last value in the array that is less than or equal to the keyframe
  let lastNearestKF: Keyframe;
  let lastNearestKFidx: number;

  for (let i = 0; i < sortedKeys.length; i++) {
    const elm = sortedKeys[i];
    if (elm.position <= position) {
      lastNearestKFidx = i;
    }
  }

  // if (!lastNearestKFidx) {
  //   lastNearestKFidx = sortedKeys.length - 2;
  // }
  lastNearestKF = sortedKeys[lastNearestKFidx];

  // Return exact match
  if (lastNearestKF.position == position) {
    return lastNearestKF.value;
  }

  // Match exists somewhere in between two KFs!

  // Which is the higher?
  const firstAfterKF = sortedKeys[lastNearestKFidx + 1];

  // The total distance between the two KFs
  const distance = firstAfterKF.position - lastNearestKF.position;
  // The distance AWAY from the lower bound
  const distanceInto = position - lastNearestKF.position;
  // Normalized distance
  const normalizedDist = mapRange(distanceInto, 0, distance, 0, 1);

  // TODO - add other kinds of interpolation and control exactly how they work
  return lerp(lastNearestKF.value, firstAfterKF.value, normalizedDist);

}