export function mapRange(value : number, low1 : number, high1 : number, low2 : number, high2 : number) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function paddedHex(value : number) : string {
  const s = Math.round(value).toString(16);
  return s.length >= 2 ? s : "0" + s;
}

export function clamp(value : number, min : number, max : number) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(value1 : number, value2 : number, amount : number) {
  return value1 + (value2 - value1) * clamp(amount, 0, 1);
}

export function rgbToHsl(r : number, g : number, b : number) : number[] {
    // Calculate fractional RGB values
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;

    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    const l = (max + min) / 2;
    let h = l;
    let s = l;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break;
        case gf: h = (bf - rf) / d + 2; break;
        case bf: h = (rf - gf) / d + 4; break;
      }

      h /= 6;
    }

    return [h, s, l];
}

function hue2rgb(p, q, t) {
  if (t < 0) { t += 1; }
  if (t > 1) { t -= 1; }
  if (t < 1 / 6) { return p + (q - p) * 6 * t; }
  if (t < 1 / 2) { return q; }
  if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
  return p;
}

export function hslToRgb(h : number, s : number, l : number) : number[] {
  h = h % 1;
  if (h < 1) {
    h = 1 + h;
  }

  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  let r;
  let g;
  let b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [ r * 255, g * 255, b * 255 ];
}
