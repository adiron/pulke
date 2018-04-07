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
        this.startTime = Date.now();
        this.pausePlayhead = undefined;
        console.log("Bound animation for selector: " + this.parentElm);
    }
    /** Starts the animation from 0
     * @returns void
     */
    AnimationController.prototype.start = function () {
        this.startTime = Date.now();
        this.playing = true;
        this.draw();
    };
    AnimationController.prototype.savePlayhead = function () {
        this.pausePlayhead = this.playhead;
    };
    Object.defineProperty(AnimationController.prototype, "playhead", {
        get: function () {
            if (this.playing) {
                return ((Date.now() - this.startTime) % this.duration) / this.duration;
            }
            else if (this.pausePlayhead) {
                return this.pausePlayhead;
            }
            else {
                return 0;
            }
        },
        set: function (n) {
            this.scrub(n);
        },
        enumerable: true,
        configurable: true
    });
    /** Starts the animation without resetting
     * @returns void
     */
    AnimationController.prototype.resume = function () {
        if (this.pausePlayhead !== undefined) {
            console.log("Resuming from saved playhead");
            this.playhead = this.pausePlayhead;
            this.pausePlayhead = undefined;
        }
        this.playing = true;
        this.draw();
        return this.playhead;
    };
    AnimationController.prototype.stop = function () {
        this.playing = false;
        this.playhead = 0;
        return this.playhead;
    };
    AnimationController.prototype.pause = function () {
        this.savePlayhead();
        this.playing = false;
        return this.playhead;
    };
    AnimationController.prototype.draw = function () {
        var _this = this;
        var pos = this.playhead;
        this.setAll(pos);
        if (this.playing) {
            requestAnimationFrame(function () { return _this.draw(); });
        }
        else {
            console.log("Stopping draw loop");
        }
    };
    AnimationController.prototype.scrub = function (pos) {
        pos = utils_1.clamp(pos, 0, 1);
        this.startTime = Date.now() - (this.duration * pos);
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
                case "text":
                    this.kind = "text";
                    this.key = "";
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
                break;
            case "text":
                element.innerText = value;
                break;
            default:
                throw new Error("Unimplemented kind " + this.kind);
        }
    };
    return PropertyObject;
}());
exports.PropertyObject = PropertyObject;
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
//# sourceMappingURL=Controllers.js.map