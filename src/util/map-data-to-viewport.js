import twoRotations from 'two-rotations';
import mapPoints from './map-points';

// Scale the data according to the dimensions of the visualization
export default function(options) {
  var { data, zoom, width, rotationMatrix, zScale } = options;
  var orientedPoint;

  return mapPoints(data, (t, x, y, xlength, ylength) => {

    // Because of the way the viewport axes are specified, we want our
    // z value to be along the y-axis
    orientedPoint = [
      (x - xlength / 2) / (xlength * 1.41) * width * zoom,
      data[x][y] * zoom * zScale,
      (y - ylength / 2) / (ylength * 1.41) * width * zoom
    ];

    t.push(twoRotations.rotate(orientedPoint, rotationMatrix));
  });
}
