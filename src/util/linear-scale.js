// Utilities to map a value in a given scale to the equivalent
// value in another scale. Similar to d3.scale.linear.

function percentFromVal(scale, val) {
  return 1 - (scale[1] - val) / (scale[1] - scale[0]);
}

function valFromPercent(scale, percent) {
  return scale[1] - (1 - percent) * (scale[1] - scale[0]);
}

export default class Scale {
  constructor(options = {}) {
    this._domain = options.domain;
    this._range = options.range;
  }

  transformTo(val) {
    var p = percentFromVal(this._domain, val);
    return valFromPercent(this._range, p);
  }

  transformFrom(val) {
    var p = percentFromVal(this._range, val);
    return valFromPercent(this._domain, p);
  }
}
