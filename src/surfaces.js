import _ from 'lodash';
import twoRotations from 'two-rotations';
import compute from './util/compute';
import mapDataToViewport from './util/map-data-to-viewport';
import generateVisData from './util/generate-vis-data';

// The options that can be passed into
// a new Surface instance
var surfaceOptions = [
  'tagName', 'fn', 'el',
  'width', 'height',
  'colorFn',
  'zoom', 'yaw', 'pitch',
  'tResolution', 'currentFrame',
  'xyDomain', 'xyResolution', 'xyScale',
  'yDomain', 'yResolution', 'yScale',
  'xDomain', 'xResolution', 'xScale',
  'range', 'zScale',
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

      xyDomain: [-10, 10],
      xyResolution: 1,
      xyScale: 300,

      tResolution: 1,
      currentFrame: 0,

      range: [-10, 10],
      zScale: 1,
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
      xDomain: this.xDomain || this.xyDomain,
      xResolution: this.xResolution || this.xyResolution,
      yDomain: this.yDomain || this.xyDomain,
      yResolution: this.yResolution || this.xyResolution
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
  renderFrame(frame) {

    frame = typeof frame === 'undefined' ? this.currentFrame : frame;
    this.currentFrame = frame;
    var animate = false;
    var loop = false;
    var startFrame = frame;
    var endFrame;

    if (typeof frame === 'object') {
      animate = true;
      loop = frame.loop;
      startFrame = frame.from;
      endFrame = frame.to;
    }

    // If there's no cached data, then we must compute it first
    if (!this._cache) {
      this.computeData();
    }

    // Get the data for frame that we're rendering
    var data = this._cache[frame];

    // Map that data to the viewport
    var mappedData = mapDataToViewport({
      data: data,
      range: this.range,
      xScale: this.xScale || this.xyScale,
      yScale: this.yScale || this.xyScale,
      xResolution: this.xResolution || this.xyResolution,
      yResolution: this.yResolution || this.xyResolution,
      xDomain: this.xDomain || this.xyDomain,
      yDomain: this.yDomain || this.xyDomain,
      zScale: this.zScale,
      zoom: this.zoom,
      rotationMatrix: this._rotationMatrix
    });

    // Generate the data necessary to visualize the surface
    var visData = generateVisData({
      originalData: data,
      data: mappedData,
      height: this.height,
      width: this.width,
      range: this.range,
      zScale: this.zScale,
      pitch: this.pitch
    });

    if (this._type === 'canvas') {
      this._renderCanvasSurface(visData);
    } else {
      this._renderSvgSurface(visData);
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
  _renderCanvasSurface(visData) {
    var context = this.el.getContext('2d');

    // Clear the canvas
    this._clearCanvas(context);

    // Loop through the data, drawing each piece of the surface
    var p;
    visData.forEach(a => {
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

  _clearCanvas(context) {
    context.clearRect(0, 0, this.el.width, this.el.height);
  }

  // Empty out the svg
  _clearSvg() {
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
  }

  // Render the Surface as an SVG
  _renderSvgSurface(visData) {
    this._clearSvg();
    var p, path;
    visData.forEach(a => {
      p = a.path;
      path = this._createSvgElement('path');
      this._setSvgAttribute(path, 'd', this._generateDAttr(a.path));
      this._setSvgAttribute(path, 'fill', this.colorFn(a.avg));
      this.el.appendChild(path);
    });
  }

  // Generate the `d` attr value for an SVG path
  _generateDAttr(path) {
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
