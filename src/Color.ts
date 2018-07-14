import { paddedHex, lerp, rgbToHsl, hslToRgb, clamp, lerpAngle } from "./utils";

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

  public toString() : string {
    return this.rgbString;
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
    return rgbToHsl(this.r, this.g, this.b);
  }

  set hsl(value : number[]) {
    this.rgb = hslToRgb(
      value[0],
      value[1],
      value[2]
    );
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

  lerpHsl(otherColor : Color, amount : number) {
    if (amount <= 0) {
      return this;
    } else if (amount >= 1) {
      return otherColor;
    } else {
      const hsl = this.hsl;
      const otherHsl = otherColor.hsl;
      return colorFromHsl(
        lerpAngle(hsl[0], otherHsl[0], amount),
        lerp(hsl[1], otherHsl[1], amount),
        lerp(hsl[2], otherHsl[2], amount)
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

export function colorFromHsl(h : number, s : number, l : number) : Color {
  const rgb = hslToRgb(h, s, l);
  return new Color(rgb[0], rgb[1], rgb[2]);
}

export function colorFromString(s : string) : Color {
  const c = parseColorString(s);
  return new Color(c[0], c[1], c[2], c[3]);
}
