// Create these temporary variables a single time
var z1, z2, z3, z4, zAvg;

export default function(options = {}) {
  var {
    x, y,
    data, mappedData,
    offsetX, offsetY,
    range
  } = options;

  // Get the average height for this plane; later used for things like
  // the color function
  z1 = data[x][y];
  z2 = data[x-1][y];
  z3 = data[x-1][y-1];
  z4 = data[x][y-1];
  zAvg = 0.25 * (z1 + z2 + z3 + z4);

  var min = range[0];
  var max = range[1];

  // Ignore points above or below the max or min
  if (z1 > max || z2 > max || z3 > max || z4 > max) { return; }
  if (z1 < min || z2 < min || z3 < min || z4 < min) { return; }

  // This is the apparent distance of the point from the screen.
  // 'Deeper' points are further back
  var depth = mappedData[x][y][2] + mappedData[x-1][y][2] + mappedData[x-1][y-1][2] + mappedData[x][y-1][2];

  // Return an object that can be used to draw a single plane for this point
  return {
    path: {
      moveTo: [(mappedData[x][y][0]+offsetX).toFixed(10), (mappedData[x][y][1]+offsetY).toFixed(10)],
      pointOne: [(mappedData[x-1][y][0]+offsetX).toFixed(10), (mappedData[x-1][y][1]+offsetY).toFixed(10)],
      pointTwo: [(mappedData[x-1][y-1][0]+offsetX).toFixed(10), (mappedData[x-1][y-1][1]+offsetY).toFixed(10)],
      pointThree: [(mappedData[x][y-1][0]+offsetX).toFixed(10), (mappedData[x][y-1][1]+offsetY).toFixed(10)]
    },
    depth: depth,
    avg: zAvg,
    data: data[x][y]
  };
}