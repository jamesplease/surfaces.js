import _ from 'underscore';
import twoRotations from 'two-rotations';
import compute from './compute';
import createPlane from './create-plane';

var surfaceOptions = [
  'tagName', 'fn', 'el',
  'width', 'height',
  'colorFn',
  'zoom', 'yaw', 'pitch',
  'yInterval', 'xInterval', 'zInterval',
  'currentFrame', 'maxPitch',
];

// Quick-round to the nearest integer
function round(somenum) {
  return Math.round(somenum);
}

class Surface {
  constructor(options) {
    _.defaults(this, _.pick(options, surfaceOptions), {
      width: 300,
      height: 300,
      zoom: 1,
      tagName: 'canvas',
      yaw: 0.5,
      colorFn() { return '#333'; },
      pitch: 0.5,
      yInterval: [-10, 10],
      xInterval: [-10, 10],
      zInterval: [0, 10],
      currentFrame: 0,
      fn: Surface.spacetimeOrigin,
      maxPitch: Math.PI / 2
    });

    // A reference to the rotation matrix
    this._rotationMatrix = [];

    // Generate our initial rotation matrix
    this._generateRotation();

    this._ensureElement();
    this.initialize(...arguments);
  }

  initialize() {}

  _generateRotation() {
    this._rotationMatrix = twoRotations.generateMatrix(this.yaw, this.pitch);
  }

  _ensureElement() {
    if (!this.el) {
      this.el = this._createElement(_.result(this, 'tagName'));
    } else {
      this.el = _.result(this, 'el');
    }

    if (this.el.nodeName.toLowerCase() === 'canvas') {
      this.el.width = this.width;
      this.el.height = this.height;
    }
  }

  _computeData() {
    return compute(...arguments);
  }

  _createElement(tagName) {
    if (tagName === 'svg') {
      return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    } else if (tagName === 'canvas') {
      return document.createElement('canvas');
    } else {
      throw new Error('The element must be a canvas or svg.');
    }
  }

  computeData() {
    this._cache = this._computeData({
      fn: this.fn,
      startTime: this.currentFrame,
      maxTime: this.currentFrame,
      xInterval: this.xInterval,
      yInterval: this.yInterval,
      spaceStep: 1
    });

    return this;
  }

  orient(orientation) {
    _.extend(this, _.pick(orientation, ['yaw', 'pitch']));

    // Ensure that the pitch doesn't go beyond our maximum
    this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
    this._generateRotation();
    return this;
  }

  render() {
    if (!this._cache) {
      this.computeData();
    }
    var data = this._cache;

    var plane = createPlane({
      data: data[0],
      heightFn(d) { return d; },
      zoom: 1,
      height: this.height,
      width: this.width,
      rotationMatrix: this._rotationMatrix
    });

    this._renderCanvasSurface(plane);

    return this;
  }

  _renderCanvasSurface(plane) {
    var context = this.el.getContext('2d');

    // Clear the canvas
    context.clearRect (0, 0, this.el.width, this.el.height);
    var p;
    plane.forEach(a => {
      p = a.path;
      context.beginPath();
      context.fillStyle = this.colorFn(a.avg);
      context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      context.moveTo(round(p.moveTo[0]), round(p.moveTo[1]));
      context.lineTo(round(p.pointOne[0]), round(p.pointOne[1]));
      context.lineTo(round(p.pointTwo[0]), round(p.pointTwo[1]));
      context.lineTo(round(p.pointThree[0]), round(p.pointThree[1]));
      context.stroke();
      context.fill();
    });
  }
}

// Return the spacetime origin coordinate: [0, 0, 0, 0]
Surface.spacetimeOrigin = function() {
  return [[[0]]];
};

export default Surface;
