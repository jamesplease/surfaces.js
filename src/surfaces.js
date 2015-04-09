import _ from 'underscore';
import twoRotations from 'two-rotations';
import compute from './compute';
import createPlane from './create-plane';

// The options that can be passed into
// a new Surface instance
var surfaceOptions = [
  'tagName', 'fn', 'el',
  'width', 'height',
  'colorFn',
  'zoom', 'yaw', 'pitch',
  'yInterval', 'xInterval', 'zInterval',
  'currentFrame', 'maxPitch',
];

// Store a handy reference to the SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

class Surface {

  // Create a new Surface
  constructor(options) {

    // Pick out the valid options from the passed-in options,
    // then fill in the defaults.
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

    // Create and set the rotation matrix
    this._rotationMatrix = [];
    this._generateRotation();

    // Make sure that the Surface has an associated DOM element,
    // then determine if it's an SVG Surface or a Canvas Surface
    this._ensureElement();
    this._setType();

    // Finally, call initialize.
    this.initialize(...arguments);
  }

  // A method that can be overwritten to augment
  // the instantiation of a Surface
  initialize() {}

  // Generate, and cache, the Surface's data
  computeData() {
    this._cache = compute({
      fn: this.fn,
      startTime: this.currentFrame,
      maxTime: this.currentFrame,
      xInterval: this.xInterval,
      yInterval: this.yInterval,
      spaceStep: 1
    });

    return this;
  }

  // Adjust the orientation of the Surface
  orient(orientation) {
    _.extend(this, _.pick(orientation, ['yaw', 'pitch']));

    // Ensure that the pitch is within the limits
    this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
    this._generateRotation();
    return this;
  }

  // Render the surface into its element
  render() {

    // If there's no cached data, then we must compute it first
    if (!this._cache) {
      this.computeData();
    }

    var plane = createPlane({
      data: this._cache[0],
      heightFn(d) { return d; },
      zoom: 1,
      height: this.height,
      width: this.width,
      rotationMatrix: this._rotationMatrix
    });

    if (this._type === 'canvas') {
      this._renderCanvasSurface(plane);
    } else {
      this._renderSvgSurface(plane);
    }

    return this;
  }

  // Set the rotation matrix
  _generateRotation() {
    this._rotationMatrix = twoRotations.generateMatrix(this.yaw, this.pitch);
  }

  // Make sure that this Surface has an
  // associated SVG or Canvas element
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

  // Set whether this Surface is an SVG or a Canvas
  _setType() {
    this._type = this.el.nodeName.toLowerCase();
  }

  // Create a new element, given a tagName
  _createElement(tagName) {
    if (tagName === 'svg') {
      return this._createSvgElement('svg');
    } else if (tagName === 'canvas') {
      return document.createElement('canvas');
    } else {
      throw new Error('The element must be a canvas or svg.');
    }
  }

  // Render the Surface as a Canvas
  _renderCanvasSurface(plane) {
    var context = this.el.getContext('2d');

    // Clear the canvas
    context.clearRect (0, 0, this.el.width, this.el.height);

    // Loop through the data, drawing each piece of the surface
    var p;
    plane.forEach(a => {
      p = a.path;
      context.beginPath();
      context.fillStyle = this.colorFn(a.avg);
      context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      context.moveTo(Math.round(p.moveTo[0]), Math.round(p.moveTo[1]));
      context.lineTo(Math.round(p.pointOne[0]), Math.round(p.pointOne[1]));
      context.lineTo(Math.round(p.pointTwo[0]), Math.round(p.pointTwo[1]));
      context.lineTo(Math.round(p.pointThree[0]), Math.round(p.pointThree[1]));
      context.stroke();
      context.fill();
    });
  }

  // Generate an element in the SVG namespace
  _createSvgElement(tagName) {
    return document.createElementNS(SVG_NS, tagName);
  }

  // Set an attribute on an element in the SVG namespace
  _setSvgAttribute(el, attr, val) {
    el.setAttributeNS(null, attr, val);
  }

  // Render the Surface as an SVG
  _renderSvgSurface(plane) {
    var p;
    var path = this._createSvgElement('path');
    plane.forEach(a => {
      p = a.path;
      this._setSvgAttribute(path, 'd', this._generatePathString(a.path));
      this._setSvgAttribute(path, 'fill', this.colorFn(a.avg));
    });
    this.el.appendChild(p);
  }

  // Generate the `d` attr value for an SVG path
  _generatePathString(path) {
    return `M${path.moveTo[0]}, ${path.moveTo[1]}
      L${path.pointOne[0]}, ${path.pointOne[1]}
      L${path.pointTwo[0]}, ${path.pointTwo[1]}
      L${path.pointThree[0]}, ${path.pointThree[1]}`;
  }
}

// Return the spacetime origin coordinate: [0, 0, 0, 0]
Surface.spacetimeOrigin = function() {
  return [[[0]]];
};

export default Surface;
