// Simple function f
function simpleFunction(x) {
  return x*x;
}

// Get sampled data for drawing a chart
// func: the function to sample
// start: the x range start
// end: the x range end
// step: the x range step. If not supplied, will be calculated to give at least 100 points.
// returns: array of [x, y] values for the given function
function sampleFunc(func, start, end, step) {
  var xy = [];
  if (!isFinite(step)) {
    step = (end - start) / 100;
  }
  for (var x=start; x<end; x+=step) {
    xy.push([x, func(x)]);
  }
  // Add the end of the range if we haven't already (precision issues)
  if (xy[xy.length - 1][0] < end) {
    xy.push([end, func(end)]);
  }
  return xy;
}

// Compute a display precision based on a range
// start: the range start
// end: the range end
// returns: the number of digits to pass to a .toFixed() call
function computePrecision(start, end) {
  var range = end - start;
  var digitIndex = (Math.log(range) / Math.log(10)).toFixed(0);
  return 4 - digitIndex;
}

// Apply a binary function element-wise
// func: the binary function to apply element-wise
// a: the first array, elements used as first arg of func
// b: the second array, elements used as second arg of func. Must be at least as long as a.
// returns: a new array [func(a[0], b[0]), func(a[1], b[1]), ...]
function binaryMap(func, a, b) {
  var result = [];
  $.each(a, function (index, value) {
    result.push(func(value, b[index]));
  });
  return result;
}

// Compute a range from a list of samples
// samples: The samples to compute the range for
// returns: an array [[startDim0, endDim0], [startDim1, endDim1], ...] containing the range for each dimension of the samples
function computeRange(samples) {
  // slice() is a hack for cloning
  var lowerBound = samples[0].slice();
  var upperBound = samples[0].slice();
  $.each(samples, function (index, value) {
    lowerBound = binaryMap(Math.min, lowerBound, value);
    upperBound = binaryMap(Math.max, upperBound, value);
  });
  var ranges = [];
  $.each(lowerBound, function (index, value) {
    ranges.push([value, upperBound[index]]);
  });
  return ranges;
}

// Make a HighCharts chart from a 1-D objective function
// selector: the CSS selector for the element to create the chart in
// func: the 1-D objective function to use
// start: the start of the x range to plot the chart over
// end: the end of the x range to plot the chart over
function makeChart(selector, func, start, end) {
  // Sample the function
  var samples = sampleFunc(func, start, end);

  // Compute the Y range
  var yRange = computeRange(samples)[1];

  // Compute the precision we should display tooltips over
  var xPrec = computePrecision(start, end);
  var yPrec = computePrecision.apply(this, yRange);

  // Make the chart
  $(selector).highcharts({
    chart: {
      type: 'line',
      backgroundColor: 'none'
    },
    legend: {
      enabled: false
    },
    tooltip: {
      formatter: function () {
        return 'x: <b>' + this.x.toFixed(xPrec) + '</b><br />f(x): <b>' + this.y.toFixed(yPrec) + '</b>';
      }
    },
    title: {
      text: null
    },
    xAxis: {
      title: {
        text: 'x'
      }
    },
    yAxis: {
      title: {
        text: 'f(x)'
      }
    },
    series: [{
      name: 'f(x)',
      data: samples,
      allowPointSelect: false,
      marker: {
        enabled: false
      },
    }]
  });
}

// Main function on load
$(function () {
  // Render the simple function chart
  makeChart('#simple-function-chart', simpleFunction, -2, 2);
});