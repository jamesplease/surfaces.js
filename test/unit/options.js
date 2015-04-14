import Surface from '../../src/surfaces';
import _ from 'lodash';

var newSurface;
var fn, colorFn, strokeColorFn;

describe('Options', () => {
  describe('When passing in options to the Surface', () => {
    beforeEach(() => {
      fn = function() {};
      colorFn = function() {};
      strokeColorFn = function() {};

      newSurface = new Surface({
        pasta: 'ok',
        tagName: 'canvas',
        fn, colorFn, strokeColorFn,
        width: 100,
        height: 1000,
        zoom: 50,
        yaw: 100,
        pitch: Math.PI,
        xyDomain: [10, 100],
        xyResolution: [-50, 50],
        xyScale: 20,
        yDomain: [10, 11],
        yResolution: 10,
        yScale: 50,
        xDomain: [15, 16],
        xResolution: 321,
        xScale: 123,
        range: [-1, 1],
        zScale: 72,
        maxPitch: Math.PI * 2
      });
    });

    it('should only accept the valid options of the Surface', () => {
      expect(newSurface).to.contain.all.keys(Surface.surfaceOptions);
    });

    it('should not have any of the invalid options', () => {
      expect(newSurface).to.not.have.any.keys(['pasta']);
    });

    it('should set the values of the surface properties to be what was passed in', () => {
      expect(newSurface.fn).to.equal(fn);
      expect(newSurface.colorFn).to.equal(colorFn);
      expect(newSurface.strokeColorFn).to.equal(strokeColorFn);
      expect(newSurface.tagName).to.equal('canvas');
      expect(newSurface.width).to.equal(100);
      expect(newSurface.height).to.equal(1000);
      expect(newSurface.zoom).to.equal(50);
      expect(newSurface.yaw).to.equal(100);
      expect(newSurface.pitch).to.equal(Math.PI);
      expect(newSurface.maxPitch).to.equal(Math.PI * 2);
      expect(newSurface.xyDomain).to.deep.equal([10, 100]);
      expect(newSurface.xyResolution).to.deep.equal([-50, 50]);
      expect(newSurface.xyScale).to.equal(20);
      expect(newSurface.yDomain).to.deep.equal([10, 11]);
      expect(newSurface.yResolution).to.equal(10);
      expect(newSurface.yScale).to.equal(50);
      expect(newSurface.xDomain).to.deep.equal([15, 16]);
      expect(newSurface.xResolution).to.equal(321);
      expect(newSurface.xScale).to.equal(123);
      expect(newSurface.range).to.deep.equal([-1, 1]);
      expect(newSurface.zScale).to.equal(72);
    });
  });

  // The attributes that aren't given defaults
  var noDefaults = [
    'xDomain', 'yDomain',
    'xScale', 'yScale',
    'xResolution', 'yResolution'
  ];

  describe('when passing in no options to the surface', () => {
    beforeEach(() => {
      newSurface = new Surface();
    });

    it('should set defaults for some of the attributes', () => {
      var defaultKeys = _.without(Surface.surfaceOptions, ...noDefaults);
      expect(newSurface).to.contain.all.keys(defaultKeys);
    });
  });
});
