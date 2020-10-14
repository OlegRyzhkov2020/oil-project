//------------------------------------------------------------------------------
//Top States Table
//------------------------------------------------------------------------------
function buildTable(states, x_data, y_data, chosenXAxis, chosenYAxis) {

  var top_array_x, top_array_y;

  // Sorting data
  var array_x = []
  for (i=0; i < states.length; i++) {
    array_x.push([states[i], x_data[i]])
  };
  var array_y = []
  for (i=0; i < states.length; i++) {
    array_y.push([states[i], y_data[i]])
  }

  top_array_x = array_x.sort((a,b) => b[1]-a[1]).slice(0, 10);
  top_array_y = array_y.sort((a,b) => b[1]-a[1]).slice(0, 10);

  var trow, idx, key, dict_length;
  dict_length = top_array_x.length

  // First table
  var table = d3.select("#table-one");
  var thead = table.select("thead");
  var tbody = table.select("tbody");

  // remove any children from the tbody and thead
  thead.html("");
  tbody.html("");

  trow = tbody.append("tr");
  trow.append("th").text("TOP STATES");

  for (idx = 0; idx < dict_length; idx++) {
    key = top_array_x[idx][0].toUpperCase();
    trow.append("th").text(key);
  }
  trow = tbody.append("tr");
  trow.append("td").text(chosenXAxis.toUpperCase());

  for (idx = 0; idx < dict_length; idx++) {
    key = top_array_x[idx][1];
    trow.append("td").text(key);
  }

  // Second table
  var table = d3.select("#table-two");
  var thead = table.select("thead");
  var tbody = table.select("tbody");

  // remove any children from the tbody and thead
  thead.html("");
  tbody.html("");

  trow = tbody.append("tr");
  trow.append("th").text("TOP STATES");

  for (idx = 0; idx < dict_length; idx++) {
    key = top_array_y[idx][0].toUpperCase();
    trow.append("th").text(key);
  }
  trow = tbody.append("tr");
  trow.append("td").text(chosenYAxis.toUpperCase());

  for (idx = 0; idx < dict_length; idx++) {
    key = top_array_y[idx][1];
    trow.append("td").text(key);
  }

};
