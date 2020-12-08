//------------------------------------------------------------------------------
//Building Plot Function - Bar and Bubble Charts
//------------------------------------------------------------------------------
function buildSUBPlot(predict_summary) {

    var dateValues = [];
    var actualValues = [];
    var lassoValues = [];
    var rfValues = [];
    var i=0;
    // Read key
    for (var key in predict_summary) {
        dateValues[i] = key;
        actualValues[i] =  predict_summary[key][0].toFixed(2);
        lassoValues[i] = predict_summary[key][1].toFixed(2);
        rfValues[i] = predict_summary[key][2].toFixed(2);
        1 == ++i;
       }
    var modelValues = [dateValues, actualValues, lassoValues, rfValues];
    console.log(modelValues);

    // header values

    var headerValues = ['Date','Actual', 'LASSO','RF'];


    // create table
    var table = {
      type: 'table',
      columnwidth: [150,200,200,150],
      columnorder: [0,1,2,3],
      header: {
        values: headerValues,
        align: "center",
        line: {width: 1, color: 'rgb(50, 50, 50)'},
        fill: {color: ['#008B8B']},
        font: {family: "Arial", size: 11, color: "white"}
      },
      cells: {
        values: modelValues,
        align: ["center", "center"],
        line: {color: "black", width: 1},
        fill: {color: ['#008B8B', 'rgba(33, 145, 81, 0.2)']},
        font: {family: "Arial", size: 10, color: ["black"]}
      },
      xaxis: 'x',
      yaxis: 'y',
      domain: {x: [0,0.4], y: [0,1]}
    }

    // create 1st plot
    var trace1 = {
      x: dateValues,
      y: actualValues,
      xaxis: 'x1',
      yaxis: 'y1',
      mode: 'lines',
      line: {width: 2, color: '#9748a1'},
      name: 'Actual Data'
    }
    // create 2nd plot
    var trace2 = {
      x: dateValues,
      y: lassoValues,
      xaxis: 'x2',
      yaxis: 'y2',
      mode: 'lines',
      line: {width: 2, color: '#b04553'},
      name: 'LASSO Predict'
    }

    // create 3rd plot
    var trace3 = {
      x: dateValues,
      y: rfValues,
      xaxis: 'x3',
      yaxis: 'y3',
      mode: 'lines',
      line: {width: 2, color: '#af7bbd'},
      name: 'RandomForest'
    }

    var data = [table,trace1,trace2,trace3]

    // define subplot axes
    var axis = {
      showline: true,
      zeroline: false,
      showgrid: true,
      mirror:true,
      ticklen: 4,
      gridcolor: '#008B8B',
      tickfont: {size: 10},
    }

    var axis1 = {domain: [0.5, 1], anchor: 'y1', showticklabels: false}
    var axis2 = {domain: [0.5, 1], anchor: 'y2', showticklabels: false}
    var axis3 = {domain: [0.5, 1], anchor: 'y3'}
    var axis4 = {domain: [0.66, 0.98], anchor: 'x1', tickprefix: '$', hoverformat: '.2f'}
    var axis5 = {domain: [0.34, 0.64], anchor: 'x2', tickprefix: '$', hoverformat: '.2f'}
    var axis6 = {domain: [0.0, 0.32], anchor: 'x3', tickprefix: '$', hoverformat: '.2f'}

    // define layout
    var subplotlayout = {
      title: "Test Set Comparison Summary",
      plot_bgcolor: 'rgba(33, 145, 81, 0.2)',
      showlegend: false,
      xaxis1: Object.assign(axis1,axis),
      xaxis2: Object.assign(axis2,axis),
      xaxis3: Object.assign(axis3,axis),
      yaxis1: Object.assign(axis4,axis),
      yaxis2: Object.assign(axis5,axis),
      yaxis3: Object.assign(axis6,axis)
    }

    Plotly.newPlot('myDiv', data, subplotlayout);

    var trace1 = {
      x: rfValues,
      type: 'box',
      name: 'RandomForest'
    };

    var trace2 = {
      x: lassoValues,
      type: 'box',
      name: 'Lasso'
    };

    var trace3 = {
      x: actualValues,
      type: 'box',
      name: 'Actual Data'
    };

    var data = [trace1, trace2, trace3];

    var bar_axis1 = {domain: [0, 1], anchor: 'y1', showticklabels: false}
    var bar_axis2 = {domain: [0, 1], anchor: 'y2', showticklabels: false}
    var bar_axis3 = {domain: [0, 1], anchor: 'y3'}
    var bar_axis4 = {domain: [0.66, 0.98], anchor: 'x1'}
    var bar_axis5 = {domain: [0.34, 0.64], anchor: 'x2'}
    var bar_axis6 = {domain: [0.0, 0.32], anchor: 'x3'}

    // define layout
    var boxplotlayout = {
      title: "Test Set Summary Box Plot",
      plot_bgcolor: 'rgba(33, 145, 81, 0.2)',
      showlegend: false,
      xaxis1: Object.assign(bar_axis1,axis),
      xaxis2: Object.assign(bar_axis2,axis),
      xaxis3: Object.assign(bar_axis3,axis),
      yaxis1: Object.assign(bar_axis4,axis),
      yaxis2: Object.assign(bar_axis5,axis),
      yaxis3: Object.assign(bar_axis6,axis)
    }


    // var layout = {
    //   title: 'Test Set Summary Box Plot'
    // };

    Plotly.newPlot('bar', data, boxplotlayout);
};
