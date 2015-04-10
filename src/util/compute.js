import LinearScale from './linear-scale';

// Generate spacetime coordinates, represented as a deeply-nested array,
// from the Surface's `fn`
export default function(options = {}) {
  var maxTime = options.maxTime !== undefined ? options.maxTime : 0;
  var { yDomain, xDomain, xResolution, yResolution, startTime } = options;

  var xLinearScale = new LinearScale({
    domain: [0, xResolution],
    range: xDomain
  });

  var yLinearScale = new LinearScale({
    domain: [0, yResolution],
    range: yDomain
  });

  // The space-time coordinates
  var coordinates = [];

  // Loop through all of the time values
  // specified to generate each frame
  for (var t = startTime; t <= maxTime; t++) {
    var tValues = [];
    coordinates.push(tValues);

    // First loop x,
    for (var x = 0; x <= xResolution; x++) {
      var xValues = [];
      tValues.push(xValues);

      // then loop y,
      for (var y = 0; y <= yResolution; y++) {

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
