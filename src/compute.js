// Generate spacetime coordinates, represented as a deeply-nested array,
// from the Surface's `fn`
export default function(options = {}) {
  var maxTime = options.maxTime !== undefined ? options.maxTime : 0;
  var spaceStep = options.spaceStep ? options.spaceStep : 1;
  var yInterval = options.yInterval;
  var xInterval = options.xInterval;
  var startTime = options.startTime;

  // Our space-time coordinates
  var coordinates = [];

  // Loop through all of the time values
  // specified to generate each frame
  for (var t = startTime; t <= maxTime; t++) {
    var tValues = [];
    coordinates.push(tValues);

    // First loop x,
    for (var x = xInterval[0]; x <= xInterval[1]; x++) {
      var xValues = [];
      tValues.push(xValues);

      // then loop y,
      for (var y = yInterval[0]; y <= yInterval[1]; y++) {

        // and finally call the function, passing
        // the x, y, and t values for this point
        xValues.push(options.fn(x, y, t, spaceStep));
      }
    }
  }
  return coordinates;
}
