import Surface from '../../src/surfaces';

var newSurface;
var fn, colorFn, strokeColorFn;
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
      xResolution: 321
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
});
