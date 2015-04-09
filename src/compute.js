// Generate spacetime coordinates, represented as a deeply-nested array,
// from the Surface's `fn`
export default function(options = {}) {
  var maxTime = options.maxTime !== undefined ? options.maxTime : 0;
  var spaceStep = options.spaceStep ? options.spaceStep : 1;
  var yDomain = options.yDomain;
  var xDomain = options.xDomain;
  var startTime = options.startTime;

  // The space-time coordinates
  var coordinates = [];

  // Loop through all of the time values
  // specified to generate each frame
  for (var t = startTime; t <= maxTime; t++) {
    var tValues = [];
    coordinates.push(tValues);

    // First loop x,
    for (var x = xDomain[0]; x <= xDomain[1]; x++) {
      var xValues = [];
      tValues.push(xValues);

      // then loop y,
      for (var y = yDomain[0]; y <= yDomain[1]; y++) {

        // and finally call the function, passing
        // the x, y, and t values for this point
        xValues.push(options.fn(x, y, t, spaceStep));
      }
    }
  }
  return coordinates;
}
