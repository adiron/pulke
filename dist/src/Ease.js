"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var BezierEasing = require("bezier-easing");
var LinearInterpolation = /** @class */ (function () {
    function LinearInterpolation() {
    }
    LinearInterpolation.prototype.do = function (v1, v2, p) {
        p = p < 0 ? 0 : p;
        p = p > 1 ? 1 : p;
        return v1 + (v2 - v1) * p;
    };
    return LinearInterpolation;
}());
exports.LinearInterpolation = LinearInterpolation;
var EaseInQuadInterpolation = /** @class */ (function () {
    function EaseInQuadInterpolation() {
    }
    EaseInQuadInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(p * p, 0, 1, v1, v2);
    };
    return EaseInQuadInterpolation;
}());
exports.EaseInQuadInterpolation = EaseInQuadInterpolation;
var EaseOutQuadInterpolation = /** @class */ (function () {
    function EaseOutQuadInterpolation() {
    }
    EaseOutQuadInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(p * (2 - p), 0, 1, v1, v2);
    };
    return EaseOutQuadInterpolation;
}());
exports.EaseOutQuadInterpolation = EaseOutQuadInterpolation;
var EaseInOutQuadInterpolation = /** @class */ (function () {
    function EaseInOutQuadInterpolation() {
    }
    EaseInOutQuadInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(p < .5 ? 2 * p * p : -1 + (4 - 2 * p) * p, 0, 1, v1, v2);
    };
    return EaseInOutQuadInterpolation;
}());
exports.EaseInOutQuadInterpolation = EaseInOutQuadInterpolation;
var EaseInCubicInterpolation = /** @class */ (function () {
    function EaseInCubicInterpolation() {
    }
    EaseInCubicInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(p * p * p, 0, 1, v1, v2);
    };
    return EaseInCubicInterpolation;
}());
exports.EaseInCubicInterpolation = EaseInCubicInterpolation;
var EaseOutCubicInterpolation = /** @class */ (function () {
    function EaseOutCubicInterpolation() {
    }
    EaseOutCubicInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange((--p) * p * p + 1, 0, 1, v1, v2);
    };
    return EaseOutCubicInterpolation;
}());
exports.EaseOutCubicInterpolation = EaseOutCubicInterpolation;
var EaseInOutCubicInterpolation = /** @class */ (function () {
    function EaseInOutCubicInterpolation() {
    }
    EaseInOutCubicInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(p < .5 ? 4 * p * p * p : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1, 0, 1, v1, v2);
    };
    return EaseInOutCubicInterpolation;
}());
exports.EaseInOutCubicInterpolation = EaseInOutCubicInterpolation;
var EaseInQuartInterpolation = /** @class */ (function () {
    function EaseInQuartInterpolation() {
    }
    EaseInQuartInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(p * p * p * p, 0, 1, v1, v2);
    };
    return EaseInQuartInterpolation;
}());
exports.EaseInQuartInterpolation = EaseInQuartInterpolation;
var EaseOutQuartInterpolation = /** @class */ (function () {
    function EaseOutQuartInterpolation() {
    }
    EaseOutQuartInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(1 - (--p) * p * p * p, 0, 1, v1, v2);
    };
    return EaseOutQuartInterpolation;
}());
exports.EaseOutQuartInterpolation = EaseOutQuartInterpolation;
var EaseInOutQuartInterpolation = /** @class */ (function () {
    function EaseInOutQuartInterpolation() {
    }
    EaseInOutQuartInterpolation.prototype.do = function (v1, v2, p) {
        return utils_1.mapRange(p < .5 ? 8 * p * p * p * p : 1 - 8 * (--p) * p * p * p, 0, 1, v1, v2);
    };
    return EaseInOutQuartInterpolation;
}());
exports.EaseInOutQuartInterpolation = EaseInOutQuartInterpolation;
var FrozenInterpolation = /** @class */ (function () {
    function FrozenInterpolation() {
    }
    FrozenInterpolation.prototype.do = function (v1, v2, p) {
        return v1;
    };
    return FrozenInterpolation;
}());
exports.FrozenInterpolation = FrozenInterpolation;
var BezierInterpolation = /** @class */ (function () {
    function BezierInterpolation(x1, y1, x2, y2) {
        this.bezierFunction = BezierEasing(x1, y1, x2, y2);
    }
    BezierInterpolation.prototype.do = function (v1, v2, p) {
        var n = this.bezierFunction(p);
        return utils_1.mapRange(n, 0, 1, v1, v2);
    };
    return BezierInterpolation;
}());
exports.BezierInterpolation = BezierInterpolation;
// Filters
var GranularFilter = /** @class */ (function () {
    function GranularFilter(ease, granularity) {
        this.granularity = granularity;
        this.ease = ease;
    }
    GranularFilter.prototype.do = function (v1, v2, p) {
        var v = this.ease.do(v1, v2, p);
        return Math.floor(v / this.granularity) * this.granularity;
    };
    return GranularFilter;
}());
exports.GranularFilter = GranularFilter;
var MapFilter = /** @class */ (function () {
    function MapFilter(ease, low1, high1, low2, high2) {
        this.ease = ease;
        this.low1 = low1;
        this.high1 = high1;
        this.low2 = low2;
        this.high2 = high2;
    }
    MapFilter.prototype.do = function (v1, v2, p) {
        var v = this.ease.do(v1, v2, p);
        return utils_1.mapRange(v, this.low1, this.high1, this.low2, this.high2);
    };
    return MapFilter;
}());
exports.MapFilter = MapFilter;
function parseFilterOn(s, e) {
    var parts = s.split(/ +/);
    switch (parts[0]) {
        case "granular":
            return new GranularFilter(e, parseFloat(parts[1]));
        case "map":
            return new MapFilter(e, parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]));
        default:
            console.log("Unknown filter: " + s);
            return e;
    }
}
function detectEase(s) {
    if (!s || s == "linear") {
        return new LinearInterpolation();
    }
    var parts = s.split(':').map(function (e) { return e.trim(); });
    var interpolationParams = parts.shift().split(/ +/);
    var interpolationName = interpolationParams.shift(); // Pop the head
    var baseObj;
    switch (interpolationName) {
        case "linear":
            baseObj = new LinearInterpolation();
            break;
        case "in-quad":
            baseObj = new EaseInQuadInterpolation();
            break;
        case "out-quad":
            baseObj = new EaseOutQuadInterpolation();
            break;
        case "in-out-quad":
            baseObj = new EaseInOutQuadInterpolation();
            break;
        case "in-cubic":
            baseObj = new EaseInCubicInterpolation();
            break;
        case "out-cubic":
            baseObj = new EaseOutCubicInterpolation();
            break;
        case "in-out-cubic":
            baseObj = new EaseInOutCubicInterpolation();
            break;
        case "in-quart":
            baseObj = new EaseInQuartInterpolation();
            break;
        case "out-quart":
            baseObj = new EaseOutQuartInterpolation();
            break;
        case "in-out-quart":
            baseObj = new EaseInOutQuartInterpolation();
            break;
        case "frozen":
            baseObj = new FrozenInterpolation();
            break;
        case "bezier":
            baseObj = new BezierInterpolation(parseFloat(interpolationParams[0]), parseFloat(interpolationParams[1]), parseFloat(interpolationParams[2]), parseFloat(interpolationParams[3]));
            break;
        default:
            console.log("Unknown ease '" + s + "'. Defaulting to linear.");
            return new LinearInterpolation();
    }
    // Parts is a tail with filters.
    for (var i = 0; i < parts.length; i++) {
        baseObj = parseFilterOn(parts[i], baseObj);
    }
    return baseObj;
}
exports.detectEase = detectEase;
//# sourceMappingURL=Ease.js.map