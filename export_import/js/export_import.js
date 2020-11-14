var height = 500;
var width = 960;

var projection = d3.geoKavrayskiy7()
    .scale(200)
    // .rotate([-205, -10])
    // .translate([width/2, height/2])
    // .precision(0.1);

var path = d3.geoPath().projection(projection);

var svg = d3.select("#mapExpImp").append("svg")
    .attr("width", width)
    .attr("height", height);

var g1 = svg.append("g");

d3.json("./data/land-110m.json",function(error,world) {
    g1.insert("path")
        .datum(topojson.feature(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);


})