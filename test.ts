import { expect } from 'chai';
import 'mocha';
import { AnimationController, AnimPropController } from './src/Controllers';
import { detectEase } from './src/Ease';

describe('Animation specs calculations', () => {

  let prop : AnimPropController = new AnimPropController({
    property: "width",
    keyframes: [ // These are not in order on purpose
                { position: 0.5, value : 50 },
                { position: 0.3, value : 70 },
                { position: 0.1, value : 10 },
                { position: 0.4, value : 40 }]
  })

  let propShort : AnimPropController = new AnimPropController({
    unit: "someUnit",
    property: "width",
    keyframes: [{ position: 0, value : 10 },
                { position: 0.5, value : 50 },
                { position: 1, value : 40 }]
  })

  let propEase : AnimPropController = new AnimPropController({
    unit: "cm",
    property: "width",
    keyframes: [{ position: 0, value : 10, ease: "linear:granular 2" },
                { position: 0.5, value : 50 },
                { position: 1, value : 40 }]
  })

  it('should return the first position', () => {
    const result = prop.getNumberValueAt(0);
    const result2 = prop.getNumberValueAt(-200);
    expect(result).to.equal(10);
    expect(result2).to.equal(result);
  });

  it('should pre-sort keyframe storage', () => {
    const sorted = prop.keyframes.sort((a,b) => a.position - b.position);
    expect(sorted).to.eql(prop.keyframes);
    expect(sorted).to.be.lengthOf(prop.keyframes.length);
  });

  it('should return the last position', () => {
    const result = prop.getNumberValueAt(0.6);
    const result2 = prop.getNumberValueAt(2823);
    expect(result).to.equal(50);
    expect(result2).to.equal(result);
  });

  it('should return the exact position', () => {
    const result = prop.getNumberValueAt(0.3);
    expect(result).to.equal(70);
  });

  it('should interpolate positions linearly', () => {
    const result = prop.getNumberValueAt(0.45);
    const result2 = prop.getNumberValueAt(0.2);
    expect(result).to.equal(45);
    expect(result2).to.be.within(39.99, 40.01);
  });
  
  it('should interpolate positions linearly (3 keyframe prop)', () => {
    const result1 = propShort.getNumberValueAt(0.25);
    const result2 = propShort.getNumberValueAt(0.75);
    expect(result1).to.equal(30);
    expect(result2).to.equal(45);
  });
  
  it('should return pixels by default', () => {
    const result1 = prop.getValueAt(0);
    expect(result1).to.equal("10px")
  });
  
  it('should return a unit', () => {
    const result1 = propShort.getValueAt(0);
    expect(result1).to.equal("10someUnit")
  });
  
  it('should honor easing a unit', () => {
    const result1 = propShort.getValueAt(0);
    expect(result1).to.equal("10someUnit")
  });


});

describe('Ease detection and calculation', () => {
  it('should parse simple ease strings', () => {
    expect(detectEase("linear").do(0, 100, 0.5)).to.equal(50);
    expect(detectEase("").do(0, 100, 0.2)).to.equal(20);
  })
  it('should accept filters, and that granular works', () => {
    expect(detectEase("linear:granular 10").do(0, 100, 0.22)).to.equal(20);
    expect(detectEase("linear:granular 10").do(0, 100, 0.3887987987)).to.equal(30);
    expect(detectEase("linear:granular 10").do(0, 100, 0.4999999999999)).to.equal(40);
    expect(detectEase("linear:granular 100").do(0, 100, 0.2)).to.equal(0);
  })
  it('should honor frozen interpolation', () => {
    expect(detectEase("frozen").do(0, 100, 0.22)).to.equal(0);
    expect(detectEase("frozen").do(2323, 100, 0.22)).to.equal(2323);
  })
  it('should reject malformed filters', () => {
    expect(detectEase("linear:malformed lkjkljklj:nonsense filter").do(0, 100, 0.22)).to.equal(22);
  })
})