import { paddedHex, lerp } from "./utils";

export class Color {
  r : number;
  g : number;
  b : number;
  a : number;

  constructor(r_ : number, g_ : number, b_ : number, a_? : number) {
    this.r = r_;
    this.g = g_;
    this.b = b_;
    this.a = a_ === undefined ? 1 : a_;
  }

  get hexString() : string {
    return `#${paddedHex(this.r)}${paddedHex(this.g)}${paddedHex(this.b)}`;
  }

  get rgbString() : string {
    if (this.a >= 1) {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    } else {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
  }

  get rgba() : number[] {
    return [this.r, this.g, this.b, this.a];
  }

  set rgba(rgba : number[]) {
    this.r = rgba[0];
    this.g = rgba[1];
    this.b = rgba[2];
    if (rgba.length === 4) {
      this.a = rgba[3];
    }
  }

  get rgb() : number[] {
    return [this.r, this.g, this.b];
  }

  set rgb(rgb : number[]) {
    this.r = rgb[0];
    this.g = rgb[1];
    this.b = rgb[2];
  }

  set(r : (number[] | number | string), g? : number, b? : number, a? : number) {
    if (Array.isArray(r)) {
      this.r = r[0];
      this.g = r[1];
      this.b = r[2];
      if (r[3] !== undefined) {
        this.a = r[3];
      }
    } else if (typeof r === "string") {
      this.rgba = parseColorString(r);
    } else if (!g && !b) {
      this.r = r;
      this.g = r;
      this.b = r;
    } else if (r !== undefined && g !== undefined && b !== undefined) {
      this.r = r;
      this.g = g;
      this.b = b;
      if (a !== undefined) {
        this.a = a;
      }
    } else {
      throw new Error("Invalid color setting");
    }
  }

  get hsl() : number[] {
    // Calculate fractional RGB values
    const rf = this.r / 255;
    const gf = this.g / 255;
    const bf = this.b / 255;

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

  lerp(otherColor : Color, amount : number) {
    if (amount <= 0) {
      return this;
    } else if (amount >= 1) {
      return otherColor;
    } else {
      return new Color(
        lerp(this.r, otherColor.r, amount),
        lerp(this.g, otherColor.g, amount),
        lerp(this.b, otherColor.b, amount),
        lerp(this.a, otherColor.a, amount)
      );
    }
  }
}

function parseColorString(s : string) : number[] {
  s = s.trim().toLowerCase();
  if (s[0] === "#") {
    // Hex string
    const hexPart : string = s.match(/[a-f0-9]{3,6}/)[0];

    let c : string[];

    if (hexPart.length === 3) {
      c = hexPart.split("").map((a) => a + a);
    } else if (hexPart.length === 6) {
      c = [hexPart.slice(0, 2), hexPart.slice(2, 4), hexPart.slice(4, 6)];
    } else {
      throw new Error("Invalid hex string");
    }

    return c.map((e) => parseInt(e, 16));

  } else if (s.match(/^rgba?\([0-9. ]+,[0-9. ]+,[0-9. ]+(,[0-9. ]+)?\)$/)) {
    // RGB(A) string
    const colorPart : string = s.match(/\((.*)\)/)[1];
    const colors = colorPart.split(",").map((num) => {
      return parseFloat(num);
    });
    return colors;
  } else {
    throw new Error("Unable to parse color");
  }
}

export function colorFromString(s : string) : Color {
  const c = parseColorString(s);
  return new Color(c[0], c[1], c[2], c[3]);
}
