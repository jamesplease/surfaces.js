import mapPoints from './map-points';

// Scale the z value of each point
export default function(data, heightFunction) {
  return mapPoints(data, (t, x, y) => {
    t.push(heightFunction(data[x][y], x, y));
  });
}
