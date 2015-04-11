import LinearScale from './linear-scale';

// Generate spacetime coordinates, represented as a deeply-nested array,
// from the Surface's `fn`
export default function(options = {}) {
  var to = options.to !== undefined ? options.to : 0;
  var { yDomain, xDomain, xResolution, yResolution, from } = options;

  var xMax = (xDomain[1] - xDomain[0]) / xResolution;
  var yMax = (yDomain[1] - yDomain[0]) / yResolution;

  var xLinearScale = new LinearScale({
    domain: [0, xMax],
    range: xDomain
  });

  var yLinearScale = new LinearScale({
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
        xValues.push(options.fn(
          xLinearScale.transformTo(x),
          yLinearScale.transformTo(y),
          t));
      }
    }
  }
  return coordinates;
}
