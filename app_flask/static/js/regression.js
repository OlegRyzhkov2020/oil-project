function regr_equation(XaxisData, Yaxisdata) {
    var ReduceAddition = function(prev, cur) { return prev + cur; };

    // finding the mean of Xaxis and Yaxis data
    var xBar = XaxisData.reduce(ReduceAddition) * 1.0 / XaxisData.length;
    var yBar = Yaxisdata.reduce(ReduceAddition) * 1.0 / Yaxisdata.length;

    var SquareXX = XaxisData.map(function(d) { return Math.pow(d - xBar, 2); })
      .reduce(ReduceAddition);

    var ssYY = Yaxisdata.map(function(d) { return Math.pow(d - yBar, 2); })
      .reduce(ReduceAddition);

    var MeanDiffXY = XaxisData.map(function(d, i) { return (d - xBar) * (Yaxisdata[i] - yBar); })
      .reduce(ReduceAddition);

    var slope = MeanDiffXY / SquareXX;
    var intercept = yBar - (xBar * slope);

    return [slope, intercept];
  }
function leastSquaresequation(XaxisData, Yaxisdata) {
  var result = regr_equation(XaxisData, Yaxisdata);
  var slope = result[0];
  var intercept = result[1];

  return function(x){
    return x*slope+intercept
  }

}
