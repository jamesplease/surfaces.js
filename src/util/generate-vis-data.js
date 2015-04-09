import mapPoints from './map-points';

// Generate the data necessary to render our surface
export default function(options) {
  var originalData = options.originalData;
  var data = options.data;
  var offsetX = options.width / 2;
  var offsetY = options.height / 2;
  var planes = [];

  // The four values that make up the heights for this piece
  var z1, z2, z3, z4, zAvg;
  mapPoints(data, (t, x, y, xlength, ylength) => {

    // Bail when at the second-to-last point, because each plane
    // requires connecting a point with the point ahead of it
    if (x === xlength - 1 || y === ylength - 1) { return; }

    // This is the apparent distance of the point from the screen.
    // 'Deeper' points are further back
    var depth = data[x][y][2] + data[x+1][y][2] + data[x+1][y+1][2] + data[x][y+1][2];

    // Get the average height for this plane; later used for things like
    // the color function
    z1 = originalData[x][y];
    z2 = originalData[x+1][y];
    z3 = originalData[x+1][y+1];
    z4 = originalData[x][y+1];
    zAvg = 0.25 * (z1 + z2 + z3 + z4);

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
