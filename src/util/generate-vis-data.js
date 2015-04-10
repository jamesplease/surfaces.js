import mapPoints from './map-points';

// Generate the data necessary to render the visualization. Returns
// an object that can be used for things like drawing the surface as
// a canvas/svg, and applying color to it.
export default function(options = {}) {
  var { originalData, data, width, height, range, zScale, pitch } = options;

  // Approximate the midway point of the visualization
  var offsetX = width / 2;

  // Center the visualization within the available space
  var offsetY = height - 0.5 * (height - zScale) - Math.abs(0.5 * zScale * Math.sin(pitch));

  var planes = [];

  // The four values that make up the heights for this piece
  var z1, z2, z3, z4, zAvg;
  mapPoints(data, (t, x, y, xlength, ylength) => {

    // Bail when at the second-to-last point, because each plane
    // requires connecting a point with the point ahead of it
    if (x === xlength - 1 || y === ylength - 1) { return; }

    // Get the average height for this plane; later used for things like
    // the color function
    z1 = originalData[x][y];
    z2 = originalData[x+1][y];
    z3 = originalData[x+1][y+1];
    z4 = originalData[x][y+1];
    zAvg = 0.25 * (z1 + z2 + z3 + z4);

    var min = range[0];
    var max = range[1];

    // Ignore points above or below the max or min
    if (z1 > max || z2 > max || z3 > max || z4 > max) { return; }
    if (z1 < min || z2 < min || z3 < min || z4 < min) { return; }

    // This is the apparent distance of the point from the screen.
    // 'Deeper' points are further back
    var depth = data[x][y][2] + data[x+1][y][2] + data[x+1][y+1][2] + data[x][y+1][2];

    // Create planes by connecting each point with its neighboring points
    planes.push({

      // Generate pathing data that can be used to create an SVG or a Canvas img
      path: {
        moveTo: [(data[x][y][0]+offsetX).toFixed(10), (data[x][y][1]+offsetY).toFixed(10)],
        pointOne: [(data[x+1][y][0]+offsetX).toFixed(10), (data[x+1][y][1]+offsetY).toFixed(10)],
        pointTwo: [(data[x+1][y+1][0]+offsetX).toFixed(10), (data[x+1][y+1][1]+offsetY).toFixed(10)],
        pointThree: [(data[x][y+1][0]+offsetX).toFixed(10), (data[x][y+1][1]+offsetY).toFixed(10)]
      },
      depth: depth,
      avg: zAvg,
      data: originalData[x][y]
    });
  });

  // Sort the planes by depth
  planes.sort((a, b) => b.depth - a.depth);

  return planes;
}
