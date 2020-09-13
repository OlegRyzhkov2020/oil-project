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
    .translate([bodyWidth/2, bodyHeight/2])
    .rotate([-150,0]);

  let path = d3.geoPath()
    .projection(projection);

  var map_svg = map_container.append("svg")
    .attr("width", bodyWidth)
    .attr("height", bodyHeight)
    .call(d3.zoom().on("zoom", function () {
      map_svg.attr("transform", d3.event.transform)
    }))
    .append("g");

  map_svg.selectAll("path")
    .data(mapInfo.features)
    .enter().append("path")
    .attr("d", d => path(d))
    .attr("stroke", "black")
    .attr("fill", "none");

    // load and display the World
    //d3.json("json/world-110m2.json", function(error, topology) {
      //g.selectAll("path")
      //.data(topojson.object(topology, topology.objects.countries)
        //  .geometries)
      //.enter()
      //.append("path")
      //.attr("d", path)
    //});

    // zoom and pan


};
