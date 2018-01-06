import { expect } from 'chai';
import 'mocha';
import { AnimProp, getNumberValueAt, getValueAt } from './src/AnimSpec';
import { lerp } from './src/utils';

describe('Animation specs calculations', () => {

  let prop : AnimProp = {
    property: "width",
    keyframes: [{ position: 0.1, value : 10 },
                { position: 0.3, value : 70 },
                { position: 0.5, value : 50 },
                { position: 0.4, value : 40 }]
  }
  let propShort : AnimProp = {
    unit: "someUnit",
    property: "width",
    keyframes: [{ position: 0, value : 10 },
                { position: 0.5, value : 50 },
                { position: 1, value : 40 }]
  }

  it('should return the first position', () => {
    const result = getNumberValueAt(0, prop);
    const result2 = getNumberValueAt(-200, prop);
    expect(result).to.equal(10);
    expect(result2).to.equal(result);
  });
  it('should return the last position', () => {
    const result = getNumberValueAt(0.6, prop);
    const result2 = getNumberValueAt(2823, prop);
    expect(result).to.equal(50);
    expect(result2).to.equal(result);
  });

  it('should return the exact position', () => {
    const result = getNumberValueAt(0.3, prop);
    expect(result).to.equal(70);
  });
  it('should interpolate positions linearly', () => {
    const result = getNumberValueAt(0.45, prop);
    const result2 = getNumberValueAt(0.2, prop);
    expect(result).to.equal(45);
    expect(result2).to.be.within(39.99, 40.01);
  });
  it('should interpolate positions linearly (3 keyframe prop)', () => {
    const result1 = getNumberValueAt(0.25, propShort);
    const result2 = getNumberValueAt(0.75, propShort);
    expect(result1).to.equal(30);
    expect(result2).to.equal(45);
  });
  it('should return pixels by default', () => {
    const result1 = getValueAt(0, prop);
    expect(result1).to.equal("10px")
  });
  it('should return a unit', () => {
    const result1 = getValueAt(0, propShort);
    expect(result1).to.equal("10someUnit")
  });


});

describe('Linear interpolation utility function', () => {

  it('should interpolate linearly', () => {
    const result = lerp(0, 100, 0.5);
    expect(result).to.equal(50);
  });

  it('should interpolate linearly backwards', () => {
    const result = lerp(-100, -200, 0.5);
    expect(result).to.equal(-150);
  });

  it('clamps values down', () => {
    const result = lerp(-100, -200, -2023);
    expect(result).to.equal(-100);
  });

  it('clamps values up', () => {
    const result = lerp(-100, -200, 5852);
    expect(result).to.equal(-200);
  });


});