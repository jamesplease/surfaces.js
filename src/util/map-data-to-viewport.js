import twoRotations from 'two-rotations';
import mapPoints from './map-points';
import LinearScale from './linear-scale';

// Scale the data according to the scale of the visualization,
// then rotate the points according to the visualization's orientation
export default function(options) {
  var { data, zoom, width, rotationMatrix, range, zScale } = options;
  var orientedPoint;

  var zLinearScale = new LinearScale({
    domain: range,
    range: [0, zScale]
  });

  return mapPoints(data, (t, x, y, xlength, ylength) => {

    // Because of the way the viewport axes are specified, we want our
    // z value to be along the negative y-axis
    orientedPoint = [
      (x - xlength / 2) / (xlength * 1.41) * width * zoom,
      -zLinearScale.transformTo(data[x][y]) * zoom,
      (y - ylength / 2) / (ylength * 1.41) * width * zoom
    ];

    t.push(twoRotations.rotate(orientedPoint, rotationMatrix));
  });
}
