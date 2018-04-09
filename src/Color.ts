import { paddedHex } from "./utils";

export class Color {
    r : number;
    g : number;
    b : number;
    constructor(r_ : number, g_ : number, b_ : number, a_ : number) {
        r_ = this.r;
        g_ = this.g;
        b_ = this.b;
    }

    asHex() : string {
        return `#${paddedHex(this.r)}${paddedHex(this.g)}${paddedHex(this.b)}`
    }
}
