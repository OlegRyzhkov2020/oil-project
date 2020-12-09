//------------------------------------------------------------------------------
//Building Plot Function - Bar and Bubble Charts
//------------------------------------------------------------------------------
function buildLassoPlot(predict_summary) {

    var dateValues = [];
    var actualValues = [];
    var lassoValues = [];
    var oilValues = [];
    var dateArray = []
    var i=0;
    // Read key
    for (var key in predict_summary) {
        dateValues[i] = key;
        actualValues[i] =  predict_summary[key][0].toFixed(2);
        lassoValues[i] = predict_summary[key][1].toFixed(2);
        oilValues[i] = predict_summary[key][2].toFixed(2);
        1 == ++i;
       }

    var modelValues = [dateValues, actualValues, lassoValues, oilValues];
    dateArray = dateValues.map(date => new Date(date));

    console.log(modelValues);

    var graphDiv = document.getElementById('chart');
    var N = 1000;
    var color1 = '#006666';
    var color1Light = '#c2a5cf';
    var colorY = '#006666';
    var colorX = '#990000';

    function randomArray() {
      var out = new Array(N);
      for(var i = 0; i < N; i++) {
        out[i] = Math.random();
      }
      return out;
    }
    var x = oilValues;
    var y1 = actualValues;
    var y2 = lassoValues;

    Plotly.newPlot(graphDiv, [{
      type: 'scatter',
      mode: 'markers',
      x: x,
      y: y1,
      xaxis: 'x',
      yaxis: 'y',
      name: 'WTI vs Actual Price',
      marker: {color: colorY, size: 6, opacity: 1}
    }, {
      type: 'scatter',
      mode: 'markers',
      x: x,
      y: y2,
      xaxis: 'x',
      yaxis: 'y',
      name: 'WTI vs LASSO predict',
      marker: {color: colorX, size: 6, opacity: 1}
    }, {
      type: 'histogram',
      x: actualValues,
      xaxis: 'x2',
      yaxis: 'y2',
      name: 'Actual test',
      marker: {color: colorY}
    }, {
      type: 'histogram',
      x: y2,
      xaxis: 'x3',
      yaxis: 'y3',
      name: 'LASSO predict',
      marker: {color: colorX}
    }], {
      title: 'Lasso around the scatter points to see sub-distributions',
      dragmode: 'lasso',
      xaxis: {
        zeroline: false,
      },
      yaxis: {
        domain: [0.55, 1],
      },
      xaxis2: {
        domain: [0, 0.45],
        anchor: 'y2',
      },
      yaxis2: {
        domain: [0, 0.45],
        anchor: 'x2'
      },
      xaxis3: {
        domain: [0.55, 1],
        anchor: 'y3'
      },
      yaxis3: {
        domain: [0, 0.45],
        anchor: 'x3'
      }
    });

    graphDiv.on('plotly_selected', function(eventData) {
      var x = [];
      var y = [];

      var colors = [];
      for(var i = 0; i < N; i++) colors.push(color1Light);

      console.log(eventData.points)

      eventData.points.forEach(function(pt) {
        x.push(pt.x);
        y.push(pt.y);
        colors[pt.pointNumber] = color1;
      });

      Plotly.restyle(graphDiv, {
        x: [x, y],
        xbins: {}
      }, [1, 2]);

      Plotly.restyle(graphDiv, 'marker.color', [colors], [0]);
    });
  }
