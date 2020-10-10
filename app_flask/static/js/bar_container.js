let container = d3.select("#donut_container");
d3.csv("static/data/product_2019.csv", function(data) {
  let filteredData = data.filter(d=> {
    return d.production>2000
  })
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 30},
  width = 960/2 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  // set the ranges
  var y = d3.scaleBand()
  .range([height, 0])
  .padding(0.1);

  var x = d3.scaleLinear()
  .range([0, width]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = container.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

  // format the data
  filteredData.forEach(function(d) {
    d.production = +d.production;
  });

  // Scale the range of the data in the domains
  x.domain([0, d3.max(filteredData, function(d){ return d.production; })])
  y.domain(filteredData.map(function(d) { return d.country_code; }));
  //y.domain([0, d3.max(data, function(d) { return d.country; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
  .data(filteredData)
  .enter().append("rect")
  .attr("class", "bar")
  //.attr("x", function(d) { return x(d.country); })
  .attr("width", function(d) {return x(d.production); } )
  .attr("y", function(d) { return y(d.country_code); })
  .attr("height", y.bandwidth());

  // add the x Axis
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x)
          .ticks(8)
          //.tickFormat(d => d + 'br')
        );

  // add the y Axis
  svg.append("g")
  .call(d3.axisLeft(y));

  //showData(filteredData); // print out the top oil producers
});

function showData(clients) {
  for (let client of clients){ write(client.country+", "+client.production)};
}
function write(text) {
  container.append("div").text(text)
}
