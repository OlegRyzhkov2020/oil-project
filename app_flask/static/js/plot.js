//------------------------------------------------------------------------------
//Building Plot Function - Bar and Bubble Charts
//------------------------------------------------------------------------------
function buildMLPlot(data) {
  var top_values, top_labels, top_text_values, label, title_text;

  top_values = [];
  top_labels = [];
  top_text_values = [];
  title_text = 'Mean Square Error: '+ data[0][1].toFixed(2);
  for (i=1; i<data.length; i++) {
    label = data[i][0];
    if (label.length > 5) {
      label = label.slice(0, -6);
      label = label.toUpperCase();
    }
    label = label + " ";
    console.log(label);
    top_labels.push(label);
    top_values.push(data[i][1]);
  }

  // top_labels.push(label);
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
    orientation: 'h',
    name: 'Nuværende',
    marker: {
          color: '#008B8B'
            }
  }];

  var layout = {
    title: title_text,
    height: 300,
    width: 500
  };

  Plotly.newPlot("bar", data, layout);
};
