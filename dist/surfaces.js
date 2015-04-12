var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash'), require('two-rotations')) : typeof define === 'function' && define.amd ? define(['lodash', 'two-rotations'], factory) : global.Surface = factory(global._, global.twoRotations);
})(this, function (_, twoRotations) {
  'use strict';

  // Utilities to map a value in a given scale to the equivalent
  // value in another scale. Similar to d3.scale.linear.

  function percentFromVal(scale, val) {
    return 1 - (scale[1] - val) / (scale[1] - scale[0]);
  }

  function valFromPercent(scale, percent) {
    return scale[1] - (1 - percent) * (scale[1] - scale[0]);
  }

  var Scale = (function () {
    function Scale() {
      var options = arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Scale);

      this._domain = options.domain;
      this._range = options.range;
    }

    _createClass(Scale, [{
      key: 'transformTo',
      value: function transformTo(val) {
        var p = percentFromVal(this._domain, val);
        return valFromPercent(this._range, p);
      }
    }, {
      key: 'transformFrom',
      value: function transformFrom(val) {
        var p = percentFromVal(this._range, val);
        return valFromPercent(this._domain, p);
      }
    }]);

    return Scale;
  })();

  var compute = function compute() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    var to = options.to !== undefined ? options.to : 0;
    var yDomain = options.yDomain;
    var xDomain = options.xDomain;
    var xResolution = options.xResolution;
    var yResolution = options.yResolution;
    var from = options.from;

    var xMax = (xDomain[1] - xDomain[0]) / xResolution;
    var yMax = (yDomain[1] - yDomain[0]) / yResolution;

    var xLinearScale = new Scale({
      domain: [0, xMax],
      range: xDomain
    });

    var yLinearScale = new Scale({
      domain: [0, yMax],
      range: yDomain
    });

    // The space-time coordinates
    var coordinates = [];

    // Loop through all of the time values
    // specified to generate each frame
    for (var t = from; t <= to; t++) {
      var tValues = [];
      coordinates.push(tValues);

      // First loop x,
      for (var x = 0; x <= xMax; x++) {
        var xValues = [];
        tValues.push(xValues);

        // then loop y,
        for (var y = 0; y <= yMax; y++) {

          // and finally call the function, passing
          // the x, y, and t values for this point
          xValues.push(options.fn(xLinearScale.transformTo(x), yLinearScale.transformTo(y), t));
        }
      }
    }
    return coordinates;
  };

  // Transform 3-d `data` with `mapFn`
  var mapPoints = function mapPoints(data, mapFn) {
    var t,
        result = [];

    var xlength = data.length;
    var ylength = data[0].length;

    for (var x = 0; x < xlength; x++) {
      result.push(t = []);
      for (var y = 0; y < ylength; y++) {
        mapFn(t, x, y, xlength, ylength);
      }
    }

    return result;
  };

  var mapDataToViewport = function mapDataToViewport(options) {
    var data = options.data;
    var zoom = options.zoom;
    var rotationMatrix = options.rotationMatrix;
    var range = options.range;
    var zScale = options.zScale;
    var xResolution = options.xResolution;
    var xScale = options.xScale;
    var yResolution = options.yResolution;
    var yScale = options.yScale;
    var xDomain = options.xDomain;
    var yDomain = options.yDomain;

    var orientedPoint;

    var xMax = (xDomain[1] - xDomain[0]) / xResolution;
    var yMax = (yDomain[1] - yDomain[0]) / yResolution;

    var zLinearScale = new Scale({
      domain: range,
      range: [0, zScale]
    });

    var xLinearScale = new Scale({
      domain: [0, xMax],
      range: [-xScale / 2, xScale / 2]
    });

    var yLinearScale = new Scale({
      domain: [0, yMax],
      range: [-yScale / 2, yScale / 2]
    });

    return mapPoints(data, function (t, x, y) {

      // Because of the way the viewport axes are specified, we want our
      // z value to be along the negative y-axis
      orientedPoint = [xLinearScale.transformTo(x) * zoom, -zLinearScale.transformTo(data[x][y]) * zoom, yLinearScale.transformTo(y) * zoom];

      t.push(twoRotations.rotate(orientedPoint, rotationMatrix));
    });
  };

  var generateVisData = function generateVisData() {
    var options = arguments[0] === undefined ? {} : arguments[0];
    var originalData = options.originalData;
    var data = options.data;
    var width = options.width;
    var height = options.height;
    var range = options.range;
    var zScale = options.zScale;

    // Approximate the midway point of the visualization
    var offsetX = width / 2;

    // Center the visualization within the available space
    var offsetY = height - 0.5 * (height - zScale);

    var planes = [];

    // The four values that make up the heights for this piece
    var z1, z2, z3, z4, zAvg;
    mapPoints(data, function (t, x, y, xlength, ylength) {

      // Bail when at the second-to-last point, because each plane
      // requires connecting a point with the point ahead of it
      if (x === xlength - 1 || y === ylength - 1) {
        return;
      }

      // Get the average height for this plane; later used for things like
      // the color function
      z1 = originalData[x][y];
      z2 = originalData[x + 1][y];
      z3 = originalData[x + 1][y + 1];
      z4 = originalData[x][y + 1];
      zAvg = 0.25 * (z1 + z2 + z3 + z4);

      var min = range[0];
      var max = range[1];

      // Ignore points above or below the max or min
      if (z1 > max || z2 > max || z3 > max || z4 > max) {
        return;
      }
      if (z1 < min || z2 < min || z3 < min || z4 < min) {
        return;
      }

      // This is the apparent distance of the point from the screen.
      // 'Deeper' points are further back
      var depth = data[x][y][2] + data[x + 1][y][2] + data[x + 1][y + 1][2] + data[x][y + 1][2];

      // Create planes by connecting each point with its neighboring points
      planes.push({

        // Generate pathing data that can be used to create an SVG or a Canvas img
        path: {
          moveTo: [(data[x][y][0] + offsetX).toFixed(10), (data[x][y][1] + offsetY).toFixed(10)],
          pointOne: [(data[x + 1][y][0] + offsetX).toFixed(10), (data[x + 1][y][1] + offsetY).toFixed(10)],
          pointTwo: [(data[x + 1][y + 1][0] + offsetX).toFixed(10), (data[x + 1][y + 1][1] + offsetY).toFixed(10)],
          pointThree: [(data[x][y + 1][0] + offsetX).toFixed(10), (data[x][y + 1][1] + offsetY).toFixed(10)]
        },
        depth: depth,
        avg: zAvg,
        data: originalData[x][y]
      });
    });

    // Sort the planes by depth
    planes.sort(function (a, b) {
      return b.depth - a.depth;
    });

    return planes;
  };

  var surfaceOptions = ['tagName', 'fn', 'el', 'width', 'height', 'colorFn', 'strokeColorFn', 'zoom', 'yaw', 'pitch', 'xyDomain', 'xyResolution', 'xyScale', 'yDomain', 'yResolution', 'yScale', 'xDomain', 'xResolution', 'xScale', 'range', 'zScale', 'maxPitch'];

  // Store a handy reference to the SVG namespace
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var Surface = (function () {

    // Create a new Surface

    function Surface(options) {
      _classCallCheck(this, Surface);

      // Pick out the valid options from the passed-in options,
      // then fill in the defaults.
      _.defaults(this, _.pick(options, surfaceOptions), {
        tagName: 'canvas',
        width: 300,
        height: 300,
        zoom: 1,
        yaw: 0.5,
        pitch: 0.5,
        maxPitch: Math.PI / 2,
        colorFn: function colorFn() {
          return '#333';
        },
        strokeColorFn: function strokeColorFn() {
          return 'rgba(0,0,0,0.4)';
        },
        fn: Surface.spacetimeOrigin,
        xyDomain: [-10, 10],
        xyResolution: 1,
        xyScale: 300,
        range: [-10, 10],
        zScale: 1
      });

      // Create and set the rotation matrix
      this._rotationMatrix = [];
      this._generateRotation();

      // Make sure that the Surface has an associated DOM element,
      // then determine if it's an SVG Surface or a Canvas Surface
      this._ensureElement();
      this._setType();
    }

    _createClass(Surface, [{
      key: '_computeData',

      // Generate some coordinates for our fn
      value: function _computeData() {
        var options = arguments[0] === undefined ? {} : arguments[0];
        var from = options.from;
        var to = options.to;
        var resolution = options.resolution;

        return compute({
          fn: this.fn,
          from: from, to: to, resolution: resolution,
          xDomain: this.xDomain || this.xyDomain,
          xResolution: this.xResolution || this.xyResolution,
          yDomain: this.yDomain || this.xyDomain,
          yResolution: this.yResolution || this.xyResolution
        });
      }
    }, {
      key: 'orient',

      // Adjust the orientation of the Surface
      value: function orient(orientation) {
        _.extend(this, _.pick(orientation, ['yaw', 'pitch']));

        // Ensure that the pitch is within the limits
        this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
        this._generateRotation();
        return this;
      }
    }, {
      key: 'render',

      // Render the surface into its element
      value: function render() {
        var options = arguments[0] === undefined ? {} : arguments[0];

        var time = options.t || 0;

        // Calculate the data for this moment in time
        var data = this._computeData({
          from: time,
          to: time,
          resolution: 1
        })[0];

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

        // Render canvas or svg, based on Surface type
        if (this._type === 'canvas') {
          this._renderCanvasSurface(visData);
        } else {
          this._renderSvgSurface(visData);
        }

        return this;
      }
    }, {
      key: '_generateRotation',

      // Set the rotation matrix
      value: function _generateRotation() {
        this._rotationMatrix = twoRotations.generateMatrix(this.yaw, this.pitch);
      }
    }, {
      key: '_ensureElement',

      // Make sure that this Surface has an
      // associated SVG or Canvas element
      value: function _ensureElement() {
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
    }, {
      key: '_setType',

      // Set whether this Surface is an SVG or a Canvas
      value: function _setType() {
        this._type = this.el.nodeName.toLowerCase();
      }
    }, {
      key: '_createElement',

      // Create a new element, given a tagName
      value: function _createElement(tagName) {
        if (tagName === 'svg') {
          return this._createSvgElement('svg');
        } else if (tagName === 'canvas') {
          return document.createElement('canvas');
        } else {
          throw new Error('The element must be a canvas or svg.');
        }
      }
    }, {
      key: '_renderCanvasSurface',

      // Render the Surface as a Canvas
      value: function _renderCanvasSurface(visData) {
        var _this = this;

        var context = this.el.getContext('2d');

        // Clear the canvas
        this._clearCanvas(context);

        // Loop through the data, drawing each piece of the surface
        var p;
        visData.forEach(function (a) {
          p = a.path;
          context.beginPath();
          context.fillStyle = _this.colorFn(a.avg);
          context.strokeStyle = _this.strokeColorFn(a.avg);
          context.moveTo(Math.round(p.moveTo[0]), Math.round(p.moveTo[1]));
          context.lineTo(Math.round(p.pointOne[0]), Math.round(p.pointOne[1]));
          context.lineTo(Math.round(p.pointTwo[0]), Math.round(p.pointTwo[1]));
          context.lineTo(Math.round(p.pointThree[0]), Math.round(p.pointThree[1]));
          context.stroke();
          context.fill();
        });
      }
    }, {
      key: '_createSvgElement',

      // Generate an element in the SVG namespace
      value: function _createSvgElement(tagName) {
        return document.createElementNS(SVG_NS, tagName);
      }
    }, {
      key: '_setSvgAttribute',

      // Set an attribute on an element in the SVG namespace
      value: function _setSvgAttribute(el, attr, val) {
        el.setAttributeNS(null, attr, val);
      }
    }, {
      key: '_clearCanvas',

      // Empty the canvas
      value: function _clearCanvas(context) {
        context.clearRect(0, 0, this.el.width, this.el.height);
      }
    }, {
      key: '_clearSvg',

      // Empty the svg
      value: function _clearSvg() {
        while (this.el.firstChild) {
          this.el.removeChild(this.el.firstChild);
        }
      }
    }, {
      key: '_renderSvgSurface',

      // Render the Surface as an SVG
      value: function _renderSvgSurface(visData) {
        var _this2 = this;

        this._clearSvg();
        var p, path;
        visData.forEach(function (a) {
          p = a.path;
          path = _this2._createSvgElement('path');
          _this2._setSvgAttribute(path, 'd', _this2._generateDAttr(a.path));
          _this2._setSvgAttribute(path, 'fill', _this2.colorFn(a.avg));
          _this2.el.appendChild(path);
        });
      }
    }, {
      key: '_generateDAttr',

      // Generate the `d` attr value for an SVG path
      value: function _generateDAttr(path) {
        return 'M' + path.moveTo[0] + ', ' + path.moveTo[1] + '\n      L' + path.pointOne[0] + ', ' + path.pointOne[1] + '\n      L' + path.pointTwo[0] + ', ' + path.pointTwo[1] + '\n      L' + path.pointThree[0] + ', ' + path.pointThree[1];
      }
    }]);

    return Surface;
  })();

  // Return the spacetime origin coordinate: [0, 0, 0, 0]
  Surface.spacetimeOrigin = function () {
    return [[[0]]];
  };

  var surfaces = Surface;

  return surfaces;
});
//# sourceMappingURL=./surfaces.js.map