// Transform 3-d `data` with `mapFn`
export default function(data, mapFn) {
  var t, result = [];

  var xlength = data.length;
  var ylength = data[0].length;

  for(var x = 0; x < xlength; x++) {
    result.push(t = []);
    for(var y = 0; y < ylength; y++) {
      mapFn(t, x, y, xlength, ylength);
    }
  }

  return result;
}
