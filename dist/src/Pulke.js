"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Controllers_1 = require("./Controllers");
// This is the main class
var Pulke = /** @class */ (function () {
    function Pulke(anim) {
        this.bound = false;
        this.animations = [];
        if (anim) {
            this.load(anim);
        }
    }
    Pulke.prototype.scrub = function (position) {
        this.animations.forEach(function (e) { return e.scrub(position); });
    };
    Pulke.prototype.load = function (anim) {
        var c = new Controllers_1.AnimationController(anim);
        this.animations.push(c);
        return c;
    };
    Pulke.prototype.bind = function () {
        this.bound = true;
    };
    Pulke.prototype.start = function () {
        this.animations.forEach(function (e) { return e.start(); });
    };
    Pulke.prototype.resume = function () {
        return this.animations.map(function (e) { return e.resume(); });
    };
    Pulke.prototype.pause = function () {
        return this.animations.map(function (e) { return e.pause(); });
    };
    Pulke.prototype.stop = function () {
        return this.animations.map(function (e) { return e.stop(); });
    };
    Object.defineProperty(Pulke.prototype, "playing", {
        get: function () {
            return (this.animations.some(function (a) { return a.playing; }));
        },
        enumerable: true,
        configurable: true
    });
    return Pulke;
}());
exports.Pulke = Pulke;
