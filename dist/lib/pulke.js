(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Pulke = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

module.exports = function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    }
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var Ease_1 = require("./Ease");
var AnimationController = /** @class */ (function () {
    function AnimationController(anim) {
        this.playing = false;
        this.selector = anim.selector;
        this.parentElm = document.querySelector(anim.selector);
        this.loop = anim.loop;
        this.duration = anim.duration;
        this.loopTimes = anim.loopTimes;
        this.items = anim.items.map(function (i) { return new AnimableController(i); });
        console.log("Bound animation for selector: " + this.parentElm);
    }
    AnimationController.prototype.play = function () {
        this.playing = true;
        this.draw();
    };
    AnimationController.prototype.draw = function () {
        var _this = this;
        var pos = (Date.now() % this.duration) / this.duration;
        this.setAll(pos);
        if (this.playing) {
            requestAnimationFrame(function () { return _this.draw(); });
        }
        else {
            console.log("Stopping");
        }
    };
    AnimationController.prototype.scrub = function (pos) {
    };
    AnimationController.prototype.setAll = function (pos) {
        // Set all elements to their current props based on KFs
        for (var index = 0; index < this.items.length; index++) {
            var item = this.items[index];
            this.setOne(item, pos);
        }
    };
    AnimationController.prototype.setOne = function (item, pos) {
        var itemElem = this.parentElm.querySelector(item.selector);
        for (var propIndex = 0; propIndex < item.props.length; propIndex++) {
            var prop = item.props[propIndex];
            prop.propertyObj.set(itemElem, prop.getValueAt(pos));
        }
    };
    return AnimationController;
}());
exports.AnimationController = AnimationController;
var AnimableController = /** @class */ (function () {
    function AnimableController(animable) {
        this.selector = animable.selector;
        this.props = animable.props.map(function (i) { return new AnimPropController(i); });
    }
    return AnimableController;
}());
exports.AnimableController = AnimableController;
var PropertyObject = /** @class */ (function () {
    function PropertyObject(propstring) {
        var parts = propstring.split(":");
        // Default is style
        if (parts.length === 1) {
            this.kind = "style";
            this.key = propstring;
        }
        else {
            switch (parts[0]) {
                case "style":
                    this.kind = "style";
                    this.key = parts[1];
                    break;
                case "attr":
                    this.kind = "attr";
                    this.key = parts[1];
                    break;
                default:
                    throw new Error("Unknown property kind " + parts[0]);
            }
        }
    }
    PropertyObject.prototype.set = function (element, value) {
        switch (this.kind) {
            case "attr":
                element.setAttribute(this.key, value);
                break;
            case "style":
                element.style[this.key] = value;
        }
    };
    return PropertyObject;
}());
var AnimPropController = /** @class */ (function () {
    function AnimPropController(prop) {
        this.property = prop.property;
        this.propertyObj = new PropertyObject(this.property);
        this.keyframes = prop.keyframes
            .map(function (i) { return new KeyframeController(i); });
        this.unit = (typeof prop.unit) == 'undefined' ? "px" : prop.unit;
        this.ease = prop.ease;
        this.easeObj = Ease_1.detectEase(prop.ease);
    }
    Object.defineProperty(AnimPropController.prototype, "keyframes", {
        get: function () {
            return this._keyframes;
        },
        set: function (kfs) {
            this._keyframes = kfs
                .sort(function (a, b) { return a.position - b.position; });
        },
        enumerable: true,
        configurable: true
    });
    AnimPropController.prototype.getNumberValueAt = function (position) {
        // Find literal edge cases
        var earlyEase;
        if (this.keyframes[0].position >= position) {
            // Return and "interpolate" the first keyframe
            earlyEase = this.keyframes[0].easeObj ? this.keyframes[0].easeObj : this.easeObj;
            return earlyEase.do(this.keyframes[0].value, this.keyframes[this.keyframes.length - 1].value, 0);
        }
        else if (this.keyframes[this.keyframes.length - 1].position <= position) {
            earlyEase = this.keyframes[this.keyframes.length - 1].easeObj ? this.keyframes[this.keyframes.length - 1].easeObj : this.easeObj;
            return earlyEase.do(this.keyframes[0].value, this.keyframes[this.keyframes.length - 1].value, 1);
        }
        // Anything below here is not an edge case.
        // Find nearest value in array
        // The nearest value is the last value in the array that is less than or equal to the keyframe
        var lastNearestKF;
        var lastNearestKFidx;
        for (var i = 0; i < this.keyframes.length; i++) {
            var elm = this.keyframes[i];
            if (elm.position <= position) {
                lastNearestKFidx = i;
            }
        }
        lastNearestKF = this.keyframes[lastNearestKFidx];
        // Return exact match
        if (lastNearestKF.position == position) {
            return lastNearestKF.value;
        }
        // Match exists somewhere in between two KFs!
        // Which is the higher?
        var firstAfterKF = this.keyframes[lastNearestKFidx + 1];
        // The total distance between the two KFs
        var distance = firstAfterKF.position - lastNearestKF.position;
        // The distance AWAY from the lower bound
        var distanceInto = position - lastNearestKF.position;
        // Normalized distance
        var normalizedDist = utils_1.mapRange(distanceInto, 0, distance, 0, 1);
        // Pick an ease function
        var targetEase = lastNearestKF.easeObj ? lastNearestKF.easeObj : this.easeObj;
        return targetEase.do(lastNearestKF.value, firstAfterKF.value, normalizedDist);
    };
    AnimPropController.prototype.getValueAt = function (position) {
        return this.getNumberValueAt(position).toString() + this.unit;
    };
    return AnimPropController;
}());
exports.AnimPropController = AnimPropController;
var KeyframeController = /** @class */ (function () {
    function KeyframeController(kf) {
        this.position = kf.position;
        this.value = kf.value;
        this.ease = kf.ease;
        if (kf.ease) {
            this.easeObj = Ease_1.detectEase(kf.ease);
        }
    }
    return KeyframeController;
}());
exports.KeyframeController = KeyframeController;

},{"./Ease":3,"./utils":5}],3:[function(require,module,exports){
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

},{"./utils":5,"bezier-easing":1}],4:[function(require,module,exports){
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
    Pulke.prototype.scrubAll = function (position) {
    };
    Pulke.prototype.load = function (anim) {
        var c = new Controllers_1.AnimationController(anim);
        this.animations.push(c);
        return c;
    };
    Pulke.prototype.bind = function () {
        this.bound = true;
    };
    Pulke.prototype.play = function () {
        this.animations.forEach(function (e) { return e.play(); });
    };
    return Pulke;
}());
exports.Pulke = Pulke;

},{"./Controllers":2}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
exports.mapRange = mapRange;

},{}]},{},[4])(4)
});