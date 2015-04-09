import scaleHeight from './scale-height';
import twoRotations from 'two-rotations';
import mapPoints from './map-points';

export default function(options) {
  var { data, heightFn, zoom, width, rotationMatrix } = options;
  var heights = scaleHeight(data, heightFn);
  var orientedPoint;

  return mapPoints(data, (t, x, y, xlength, ylength) => {

    // Because of the way the viewport axes are specified, we want our
    // z value to be along the y-axis
    orientedPoint = [
      (x - xlength / 2) / (xlength * 1.41) * width * zoom,
      heights[x][y] * zoom,
      (y - ylength / 2) / (ylength * 1.41) * width * zoom
    ];

    t.push(twoRotations.rotate(orientedPoint, rotationMatrix));
  });
}
