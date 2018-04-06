"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var Controllers_1 = require("./src/Controllers");
var Ease_1 = require("./src/Ease");
describe('Animation specs calculations', function () {
    var prop = new Controllers_1.AnimPropController({
        property: "width",
        keyframes: [
            { position: 0.5, value: 50 },
            { position: 0.3, value: 70 },
            { position: 0.1, value: 10 },
            { position: 0.4, value: 40 }
        ]
    });
    var propShort = new Controllers_1.AnimPropController({
        unit: "someUnit",
        property: "width",
        keyframes: [{ position: 0, value: 10 },
            { position: 0.5, value: 50 },
            { position: 1, value: 40 }]
    });
    var propEase = new Controllers_1.AnimPropController({
        unit: "",
        property: "width",
        keyframes: [{ position: 0, value: 10, ease: "linear:granular 2" },
            { position: 0.5, value: 50 },
            { position: 1, value: 40 }]
    });
    it('should return the first position', function () {
        var result = prop.getNumberValueAt(0);
        var result2 = prop.getNumberValueAt(-200);
        chai_1.expect(result).to.equal(10);
        chai_1.expect(result2).to.equal(result);
    });
    it('should pre-sort keyframe storage', function () {
        var sorted = prop.keyframes.sort(function (a, b) { return a.position - b.position; });
        chai_1.expect(sorted).to.eql(prop.keyframes);
        chai_1.expect(sorted).to.be.lengthOf(prop.keyframes.length);
    });
    it('should return the last position', function () {
        var result = prop.getNumberValueAt(0.6);
        var result2 = prop.getNumberValueAt(2823);
        chai_1.expect(result).to.equal(50);
        chai_1.expect(result2).to.equal(result);
    });
    it('should return the exact position', function () {
        var result = prop.getNumberValueAt(0.3);
        chai_1.expect(result).to.equal(70);
    });
    it('should interpolate positions linearly', function () {
        var result = prop.getNumberValueAt(0.45);
        var result2 = prop.getNumberValueAt(0.2);
        chai_1.expect(result).to.equal(45);
        chai_1.expect(result2).to.be.within(39.99, 40.01);
    });
    it('should interpolate positions linearly (3 keyframe prop)', function () {
        var result1 = propShort.getNumberValueAt(0.25);
        var result2 = propShort.getNumberValueAt(0.75);
        chai_1.expect(result1).to.equal(30);
        chai_1.expect(result2).to.equal(45);
    });
    it('should return pixels by default', function () {
        var result1 = prop.getValueAt(0);
        chai_1.expect(result1).to.equal("10px");
    });
    it('should return a unit', function () {
        var result1 = propShort.getValueAt(0);
        chai_1.expect(result1).to.equal("10someUnit");
    });
    it('should honor empty units', function () {
        var result1 = propEase.getValueAt(0);
        chai_1.expect(result1).to.equal("10");
    });
    it('should honor easing a unit', function () {
        var result1 = propShort.getValueAt(0);
        chai_1.expect(result1).to.equal("10someUnit");
    });
});
describe('Ease detection and calculation', function () {
    it('should parse simple ease strings', function () {
        chai_1.expect(Ease_1.detectEase("linear").do(0, 100, 0.5)).to.equal(50);
        chai_1.expect(Ease_1.detectEase("").do(0, 100, 0.2)).to.equal(20);
    });
    it('should accept filters, and that granular works', function () {
        chai_1.expect(Ease_1.detectEase("linear:granular 10").do(0, 100, 0.22)).to.equal(20);
        chai_1.expect(Ease_1.detectEase("linear:granular 10").do(0, 100, 0.3887987987)).to.equal(30);
        chai_1.expect(Ease_1.detectEase("linear:granular 10").do(0, 100, 0.4999999999999)).to.equal(40);
        chai_1.expect(Ease_1.detectEase("linear:granular 100").do(0, 100, 0.2)).to.equal(0);
    });
    it('should honor frozen filter', function () {
        chai_1.expect(Ease_1.detectEase("frozen").do(0, 100, 0.22)).to.equal(0);
        chai_1.expect(Ease_1.detectEase("frozen").do(2323, 100, 0.22)).to.equal(2323);
    });
    it('should honor map filter', function () {
        chai_1.expect(Ease_1.detectEase("linear:map 0 100 0 1000").do(0, 100, 0.22)).to.equal(220);
        chai_1.expect(Ease_1.detectEase("linear:map 0 100 0 -1000").do(0, 100, 0.22)).to.equal(-220);
        chai_1.expect(Ease_1.detectEase("linear:map 0 1 0 0.5").do(0, 100, 0.1)).to.equal(5);
    });
    it('should allow bezier interpolation', function () {
        var target = 47.98696676267834;
        var result = Ease_1.detectEase("bezier 0.17 0.18 0.25 0.20").do(0, 100, 0.50);
        chai_1.expect(Math.abs(target - result)).to.be.lessThan(0.001);
    });
    it('should reject malformed filters', function () {
        chai_1.expect(Ease_1.detectEase("linear:malformed lkjkljklj:nonsense filter").do(0, 100, 0.22)).to.equal(22);
    });
    it('should honor propwide ease', function () {
        var propGlobalEase = new Controllers_1.AnimPropController({
            unit: "",
            property: "width",
            ease: "linear:map 10 40 -80 80",
            keyframes: [{ position: 0, value: 10 },
                { position: 0.5, value: 50 },
                { position: 1, value: 40 }]
        });
        chai_1.expect(propGlobalEase.getNumberValueAt(0)).to.equal(-80);
    });
});
