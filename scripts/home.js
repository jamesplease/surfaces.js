(function() {

  // The exponent in a gaussian
  function exponent(x, offset, c) {
    return -Math.pow(x - offset, 2) * 1 / (2 * Math.pow(c, 2));
  }

  // A gaussian function
  function gaussian(options) {
    return options.magnitude *
      Math.exp(
        exponent(options.x, options.xOffset, options.xStandardDeviation) +
        exponent(options.y, options.yOffset, options.yStandardDeviation)
      );
  }

  // The hero surface is the summation of
  // a collection of gaussians
  var gaussians = [
    // Far back mountain
    {
      xOffset: 20,
      yOffset: 20,
      magnitude: 220,
      xStandardDeviation: 10,
      yStandardDeviation: 10
    },

    // Far back mountain side
    {
      xOffset: 5,
      yOffset: 19,
      magnitude: 60,
      xStandardDeviation: 5,
      yStandardDeviation: 5
    },

    // Far back-right mountain side
    {
      xOffset: 5,
      yOffset: 5,
      magnitude: 70,
      xStandardDeviation: 8,
      yStandardDeviation: 3
    },

    // Front mountain
    {
      xOffset: -21,
      yOffset: -21,
      magnitude: 280,
      xStandardDeviation: 6,
      yStandardDeviation: 20
    },

    // Left ridge
    {
      xOffset: -18,
      yOffset: 18,
      magnitude: 100,
      xStandardDeviation: 5,
      yStandardDeviation: 5
    },

    // Right dip
    {
      xOffset: 14,
      yOffset: -16,
      magnitude: -70,
      xStandardDeviation: 10,
      yStandardDeviation: 5
    },

    // Right dip back bump
    {
      xOffset: 16,
      yOffset: -14,
      magnitude: 20,
      xStandardDeviation: 5,
      yStandardDeviation: 5
    },

    // Bottom right bump
    {
      xOffset: 0,
      yOffset: -18,
      magnitude: 50,
      xStandardDeviation: 5,
      yStandardDeviation: 5
    },
  ];

  // Variables for the orientation
  // animation.
  var initialYaw = -0.2;
  var initialPitch = 0.4;
  var finalYaw = -0.5;
  var finalPitch = 0.2;
  var yawDiff = finalYaw - initialYaw;
  var pitchDiff = finalPitch - initialPitch;

  var heroSurface;

  // Create, then show, the heroSurface
  function showHeroSurface() {
    heroSurface = new Surface({
      el: document.getElementById('hero-surface'),
      fn: function(x, y, t) {
        return Math.pow(Math.sin(t/50 * Math.PI/2), 3) * gaussians.reduce(function(a, g) {
          return a + gaussian({
            x: x,
            y: y,
            xOffset: g.xOffset,
            yOffset: g.yOffset,
            magnitude: g.magnitude,
            xStandardDeviation: g.xStandardDeviation,
            yStandardDeviation: g.yStandardDeviation
          }) +
          0.5 * Math.cos(y/6 * Math.PI) +
          Math.sin((x-y)/6 * Math.PI);
        }, 0);
      },
      yaw: initialYaw,
      pitch: initialPitch,
      range: [-85, 250],
      xyDomain: [-18, 18],
      xyResolution: 1,
      zScale: 250,
      width: 750,
      height: 320,
      xyScale: 400,
      colorFn: function(d) {
        var c = d3.hsl(-d+105, 0.6, 0.5).rgb();
        return 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
      }
    });

    // A bespoke little animation function
    var currentFrame = 0;
    function loop(cb, options) {
      currentFrame++;
      if (currentFrame > options.to) {
        if (options.once) {
          makeDraggable();
          return;
        }
        currentFrame = 0;
      }

      cb(currentFrame);

      requestAnimationFrame(function() {
        loop(cb, options);
      });
    }

    // Render our surface based on an iterator, i
    function render(i) {
      var yaw = initialYaw + (yawDiff * i/50);
      var pitch = initialPitch + (pitchDiff * i/50);
      heroSurface
        .orient({
          pitch: pitch,
          yaw: yaw
        })
        .render({
          t: i
        });
    }

    loop(render, {
      from: 0,
      to: 50,
      once: true
    });
  }

  $(function() {

    // Show the surface...
    showHeroSurface();
  });

  function makeDraggable() {
    heroSurface.el.className = 'move';
    document.getElementsByClassName('drag-msg')[0].className = 'drag-msg show';
    heroSurface.el.addEventListener('mousedown', setDrag);
    heroSurface.el.addEventListener('mouseup', endDrag);
    heroSurface.el.addEventListener('mousemove', moveCamera);
  }

  // How much moving the mouse scales the orientation
  var dragScale = 120;

  // Whether or not we're dragging
  var dragging = false;

  // The last position of the mouse
  var initialMousePosition;

  var yaw, pitch;
  function setDrag(e) {
    dragging = true;
    initialMousePosition = [e.clientX, e.clientY];
    yaw = heroSurface.yaw;
    pitch = heroSurface.pitch;
  }

  function endDrag() {
    dragging = false;
  }

  function moveCamera(e) {
    if(!dragging) { return; }

    // Figure out how far the mouse has moved in
    // each direction, and scale it appropriately
    var currentMousePosition = [e.clientX, e.clientY];
    var deltaYaw = (currentMousePosition[0] - initialMousePosition[0]) / dragScale;
    var deltaPitch = (currentMousePosition[1] - initialMousePosition[1]) / dragScale;

    // Finally, update our rotated surface
    heroSurface.orient({
      yaw: yaw - deltaYaw,
      pitch: pitch + deltaPitch
    }).render({t: 50});
  }
})();
