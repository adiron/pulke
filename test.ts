import { expect } from 'chai';
import 'mocha';
import { Pulke } from './src/Pulke';
import { AnimationController, AnimPropController } from './src/Controllers';
import { detectEase } from './src/Ease';
import * as utils from './src/utils';

import { JSDOM } from 'jsdom';
const { window } = new JSDOM(`<!doctype html><html><body>
                              <div class="something"><div class="ball"></div></div>
                              </body></html>`);

// Save these two objects in the global space so that libraries/tests
// can hook into them, using the above doc definition.
global['document'] = window.document;
global['window'] = window;

describe('Utils', () => {
  it('should normalize ranges correctly', () => {
    expect(utils.mapRange(10, 0, 100, 0, 1)).to.be.eq(0.1);
    expect(utils.mapRange(1, 0, 1, 0, 100)).to.be.eq(100);
    expect(utils.mapRange(-20, 0, 20, 0, 100)).to.be.eq(-100);
  });

  it('should clamp ranges correctly', () => {
    expect(utils.clamp(100, 0, 1)).to.be.eq(1);
    expect(utils.clamp(100, 0, 100)).to.be.eq(100);
    expect(utils.clamp(3.12345, 0, 100)).to.be.eq(3.12345);
    expect(utils.clamp(-10323802, 0, 100)).to.be.eq(0);
  });
})

describe('Pulke main constructor', () => {
  it('should return a Pulke object without settings', () => {
    let p = new Pulke();
    expect(p).an.instanceOf(Pulke);
  });
  it('should return a Pulke object when given setting', () => {
    let p = new Pulke({
      selector: ".something",
      duration: 5000,
      loop: true,
      items: [{
        selector: ".ball", props: [{
          property: "attr:cx",
          unit: "%",
          keyframes: [
            { position: 0, value: -2 },
            { position: 1, value: 102 }
          ]
        },
        {
          property: "attr:cy",
          keyframes: [
            { position: 0, value: 10, ease: "in-cubic" },
            { position: 0.25, value: 120, ease: "out-cubic" },
            { position: 0.5, value: 40, ease: "in-cubic" },
            { position: 0.75, value: 120, ease: "out-cubic" },
            { position: 1, value: 90, ease: "in-cubic" },
          ],
          unit: "px"
        },
        {
          property: "text",
          keyframes: [
            { position: 0, value: 23, ease: "linear" }
          ]
        },
        {
          property: "style:margin-top",
          keyframes: [
            { position: 0, value: 0, ease: "linear" },
            { position: 1, value: 10, ease: "linear" }
          ]
        }
        ]
      }]
    });
    expect(p).an.instanceOf(Pulke);
    expect(p.playing).to.be.be.eq(false);
    p.scrub(0.5);
  });
});

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
    unit: "",
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
  
  it('should honor empty units', () => {
    const result1 = propEase.getValueAt(0);
    expect(result1).to.equal("10")
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
  it('should honor frozen filter', () => {
    expect(detectEase("frozen").do(0, 100, 0.22)).to.equal(0);
    expect(detectEase("frozen").do(2323, 100, 0.22)).to.equal(2323);
  })
  it('should honor map filter', () => {
    expect(detectEase("linear:map 0 100 0 1000").do(0, 100, 0.22)).to.equal(220);
    expect(detectEase("linear:map 0 100 0 -1000").do(0, 100, 0.22)).to.equal(-220);
    expect(detectEase("linear:map 0 1 0 0.5").do(0, 100, 0.1)).to.equal(5);
  })
  it('should allow bezier interpolation', () => {
    const target = 47.98696676267834;
    const result = detectEase("bezier 0.17 0.18 0.25 0.20").do(0, 100, 0.50);
    expect(Math.abs(target - result)).to.be.lessThan(0.001);
  })
  it('should reject malformed filters', () => {
    expect(detectEase("linear:malformed lkjkljklj:nonsense filter").do(0, 100, 0.22)).to.equal(22);
  })
  it('should honor propwide ease', () => {

    let propGlobalEase : AnimPropController = new AnimPropController({
      unit: "",
      property: "width",
      ease: "linear:map 10 40 -80 80",
      keyframes: [{ position: 0, value : 10},
                  { position: 0.5, value : 50 },
                  { position: 1, value : 40 }]
    })

    expect(propGlobalEase.getNumberValueAt(0)).to.equal(-80);
  })
})
