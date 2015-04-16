import visData from './vis-data';
import LinearScale from './linear-scale';
import twoRotations from 'two-rotations';

// Generate the data necessary to render the visualization. Returns
// an object that can be used for things like drawing the surface as
// a canvas/svg, and applying color to it.
export default function(options = {}) {
  var {
    data,
    width, height,
    range, zScale,
    xScale, yScale,
    xResolution, yResolution,
    xDomain, yDomain,
    zoom, rotationMatrix
  } = options;

  var xMax = (xDomain[1] - xDomain[0]) / xResolution;
  var yMax = (yDomain[1] - yDomain[0]) / yResolution;

  var zLinearScale = new LinearScale({
    domain: range,
    range: [0, zScale]
  });

  var xLinearScale = new LinearScale({
    domain: [0, xMax],
    range: [-xScale/2, xScale/2]
  });

  var yLinearScale = new LinearScale({
    domain: [0, yMax],
    range: [-yScale/2, yScale/2]
  });

  // Approximate the midway point of the visualization
  var offsetX = width / 2;

  // Center the visualization within the available space
  var offsetY = height - 0.5 * (height - zScale);

  var planes = [];
  var mappedData = [];
  var orientedPoint;

  var xlength = data.length;
  var ylength = data[0].length;

  for(var x = 0; x < xlength; x++) {
    for(var y = 0; y < ylength; y++) {
      // Adjust our point to the viewport
      orientedPoint = [
        xLinearScale.transformTo(x) * zoom,
        -zLinearScale.transformTo(data[x][y]) * zoom,
        yLinearScale.transformTo(y) * zoom
      ];

      // Rotate it
      orientedPoint = twoRotations.rotate(orientedPoint, rotationMatrix);

      // Create our mapped data object
      mappedData[x] = mappedData[x] || [];
      mappedData[x][y] = orientedPoint;

      // Bail when at the first point, because the
      // algorithm forms planes with the previous point
      if (x === 0 || y === 0) { continue; }

      planes.push(visData({
        x, y, range,
        data, mappedData,
        offsetX, offsetY
      }));
    }
  }

  // Sort the planes by depth
  planes.sort((a, b) => b.depth - a.depth);

  return planes;
}
