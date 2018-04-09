import { paddedHex, lerp } from "./utils";

export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r_: number, g_: number, b_: number, a_: number) {
        this.r = r_;
        this.g = g_;
        this.b = b_;
        this.a = a_;
    }

    get hexString(): string {
        return `#${paddedHex(this.r)}${paddedHex(this.g)}${paddedHex(this.b)}`
    }

    get rgbString(): string {
        if (this.a >= 1) {
            return `rgb(${this.r}, ${this.g}, ${this.b})`;
        } else {
            return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
        }
    }

    get rgb(): number[] {
        return [ this.r, this.g, this.b, this.a ];
    }

    get hsl(): number[] {
        // Calculate fractional RGB values
        const rf = this.r / 255;
        const gf = this.g / 255;
        const bf = this.b / 255;

        const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
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

    lerp(otherColor: Color, amount: number) {
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
