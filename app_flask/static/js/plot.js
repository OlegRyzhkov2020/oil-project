//------------------------------------------------------------------------------
//Building Plot Function - Bar and Bubble Charts
//------------------------------------------------------------------------------
function buildMLPlot(data) {
  var top_values, top_labels, top_text_values;

  top_values = [];
  top_labels = [];
  top_text_values = [];
  for (i=1; i<data.length; i++) {
    console.log(data);
    top_labels.push(data[i][0]);
    top_values.push(data[i][1]);
  }
  console.log(top_labels, top_values, top_text_values);
  //------------------------------------------------------------------------------
  //Bar Chart
  //------------------------------------------------------------------------------
  var data = [{
    x: top_values,
    y: top_labels,
    text: top_text_values,
    hovertemplate: ' Sample Value: %{x}<br> otu_ids: %{y}<br> Placement:%{text}<br> Model: ',
    type: "bar",
    orientation: 'h'
  }];

  var layout = {
    title:'Features Importance',
    height: 300,
    width: 500
  };

  Plotly.newPlot("bar", data, layout);
};
