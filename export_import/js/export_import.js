// consider: rotating globe???
// https://bl.ocks.org/atanumallick/8d18989cd538c72ae1ead1c3b18d7b54
// https://gist.github.com/atanumallick/8d18989cd538c72ae1ead1c3b18d7b54

var height = 500;
var width = 960;

var flow=["export", "import"];

// curve line source:
// https://stackoverflow.com/questions/56562231/line-on-d3-map-not-forming-a-curve
var curve = function(context) {
    var custom = d3.curveLinear(context);
    custom._context = context;
    custom.point = function(x,y) {
      x = +x, y = +y;
      switch (this._point) {
        case 0: this._point = 1; 
          this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
          this.x0 = x; this.y0 = y;        
          break;
        case 1: this._point = 2;
        default: 
          var x1 = this.x0 * 0.5 + x * 0.5;
          var y1 = this.y0 * 0.5 + y * 0.5;
          var m = 1/(y1 - y)/(x1 - x);
          var r = -100; // offset of mid point.
          var k = r / Math.sqrt(1 + (m*m) );
          if (m == Infinity) {
            y1 += r;
          }
          else {
            y1 += k;
            x1 += m*k;
          }     
          this._context.quadraticCurveTo(x1,y1,x,y); 
          this.x0 = x; this.y0 = y;        
          break;
      }
    }
    return custom;
  }

  var projection = d3.geoKavrayskiy7()
    // .scale(200)
    .rotate([-220, -5])
    .translate([width/2, height/2])
    .precision(0.1);
    
  var line=d3.line()
  .x(function(d) {
    //   return projection ([+d.lon, +d.lat])[0];
    return projection (d)[0];
  })
  .y(function(d) {
    // return projection ([+d.lon, +Sd.lat])[1];
    return projection (d)[1];
  })
  .curve(curve)



var path = d3.geoPath().projection(projection);

var svg = d3.select("#mapD3").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");
var g2 = svg.append("g");

var buttons = g2.selectAll(".flowButton")
			.data(flow)
			.enter()
			.append("rect")
			.attr("x", function(d,i) { return i * 90 + 20} )
			.attr("y", 400)
			.attr("rx",20).attr("ry",20).attr("width",80).attr("height",80)
			.attr("fill","#aaa").attr("stroke","#999")
			.attr("class","flowButton")
            .on("click",function(d) { updateFlow(d); });
            
var buttonsText = g2.selectAll(".flowLabel")
			.data(flow).enter()
			.append("text")
			.attr("x",function (d,i) { return i * 90 + 60} )
			.attr("y",445)
			.attr("text-anchor","middle")
			.text(function(d) { return d; })
			.attr("class","commodityLabel")
            .on("click",function(d) { updateFlow(d); });

function getUSA(feature) {
    return (feature.properties["Reporter ISO"] === "USA" &&
            feature.properties["Commodity"] === "PETROLEUM PRODUCTS");
};

function getColor(flow) {
    switch (flow) {
        case "export":
            return "darkred";
        default:
            return "darkblue";
}};

function updateFlow(flow) {

    var flowLines = g.selectAll(".flow-line")
    .transition()
    .duration(1000)
    .attr("stroke-dashoffset",  function() { return -this.getTotalLength(); })
    .transition().duration(0).remove();

    drawGlobe();
    drawFlow(flow);  
}

function drawGlobe() {
d3.json("./data/countries-110m.json",function(error,world) {

    // var countries = topojson.feature(world, world.objects.countries);

    g.insert("path")
        .datum(topojson.feature(world, world.objects.countries))
        .attr("class", "land")
        .attr("d", path);

});}

// ./data/oil_country_flows_${flow}s.geojson
function drawFlow(flow) {
    d3.json(`${flow}.geojson`, function(error, dataset) {
        console.log(getColor(flow))
        // console.log(dataset);
        var features = dataset.features;
        console.log(features);
    
        // inspired by: http://bl.ocks.org/Andrew-Reid/35d89fbcfbcfe9e819908ea77fc5bef6
        var maxVolume = d3.max(features, function(d) {  return d.properties["volume"]; });
        console.log(maxVolume);
        
        features.forEach( function(d,i) {
            var flow1 = g
                .append("path")
                .attr("d", line(d.geometry.coordinates))
                .attr("class", "flow-line")
                .style("stroke", getColor(flow)) 
                .attr("stroke-opacity", Math.sqrt((+d.properties["volume"] / maxVolume)*2) )
                .attr("stroke-width", 5);
            
            var totalLength = flow1.node().getTotalLength() +10;

            flow1
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            // .on("start", drawPorts(d) )
            .attr("stroke-dashoffset", 0);
        });

    });
    
};

drawGlobe();


  
 