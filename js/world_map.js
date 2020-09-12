// Load countries json data
map_container = d3.select("#world_map")
d3.json("countries/countries.geo.json", function(data) {
  mapData(data);
});


function mapData(mapInfo) {
  let bodyHeight = 450;
  let bodyWidth = 1000;

  let projection = d3.geoNaturalEarth1()
    .scale(150)
    .translate([bodyWidth/2, bodyHeight/2]);

  let path = d3.geoPath()
    .projection(projection);

  var map_svg = map_container.append("svg")
    .attr("width", bodyWidth)
    .attr("height", bodyHeight);
  var g = map_svg.append("g");

  map_svg.selectAll("path")
    .data(mapInfo.features)
    .enter().append("path")
    .attr("d", d => path(d))
    .attr("stroke", "black")
    .attr("fill", "none")

//  var map_svg = map_container.append("svg")
//      .attr("width", bodyWidth)
//      .attr("height", bodyHeight);
//  var g = map_svg.append("g");

};
