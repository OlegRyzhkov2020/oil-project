let donut_container = d3.select("#donut_container");
d3.csv("outputs/product_2019.csv", function(data) {
  var filteredData = data.filter(d=> {
    return d.production>2000
  });
  showData(filteredData);
});

function showData(data) {
  let bodyHeight = 200;
  let bodyWidth = 400;

  data = data.map(d => ({
    country: d.country,
    production: +d.production
  }))
  console.log(data);
  // set the dimensions and margins of the graph
  var width = 450
      height = 450
      margin = 40

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  var radius = Math.min(width, height) / 2 - margin

  // append the svg object to the div called 'my_dataviz'
  var svg = donut_container.append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Create dummy data
  var data = {a: 9, b: 20, c:30, d:8, e:12}

  // set the color scale
  var color = d3.scaleOrdinal()
    .domain(data)
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", , "#6b486b", "#a05d56"])

  // Compute the position of each group on the pie:
  var pie = d3.pie()
    .value(function(d) {return d.value; })
  var data_ready = pie(d3.entries(data))

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(100)         // This is the size of the donut hole
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  }
