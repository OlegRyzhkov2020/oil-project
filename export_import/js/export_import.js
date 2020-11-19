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

  var line=d3.line()
  .x(function(d) {
    return projection (d)[0];
  })
  .y(function(d) {
    return projection (d)[1];
  })
  .curve(curve)

var projection = d3.geoKavrayskiy7()
    // .scale(200)
    .rotate([-205, -5])
    .translate([width/2, height/2])
    // .precision(0.1);

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

/// v1: line animation source:
// http://bl.ocks.org/erikhazzard/6201948
// https://stackoverflow.com/questions/18165533/how-to-draw-a-line-link-between-two-points-on-a-d3-map-based-on-latitude-lon

// var lineTransition = function lineTransition(path) {
//     path.transition()
//     //NOTE: Change this number (in ms) to make lines draw faster or slower
//     .duration(5500)
//     .attrTween("stroke-dasharray", tweenDash)
//     // .each("end", function(d,i) { 
//         ////Uncomment following line to re-transition
//         // d3.select(this).call(transition); 
                  
//         //We might want to do stuff when the line reaches the target,
//         //  like start the pulsating or add a new point or tell the
//         //  NSA to listen to this guy's phone calls
//         //doStuffWhenLineFinishes(d,i);
//         // });
// };
// var tweenDash = function tweenDash() {
//     //This function is used to animate the dash-array property, which is a
//     //  nice hack that gives us animation along some arbitrary path (in this
//     //  case, makes it look like a line is being drawn from point A to B)
//     var len = this.getTotalLength(),
//         interpolate = d3.interpolateString("0," + len, len + "," + len);

//     return function(t) { return interpolate(t); };
// };

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

    // enableRotation()
});}

function drawFlow(flow) {
    d3.json(`./data/oil_country_flows_${flow}s.geojson`, function(error, dataset) {
        console.log(getColor(flow))
        console.log(dataset);
        var features = dataset.features;
        console.log(features);
        
        var usaTop10 = features.filter(getUSA)
                            .sort((a, b) => b.properties["Qty"] - a.properties["Qty"])
                            .slice(0,10);
        
        console.log(usaTop10);

        // inspired by: http://bl.ocks.org/Andrew-Reid/35d89fbcfbcfe9e819908ea77fc5bef6
        var maxVolume = d3.max(usaTop10, function(d) {  return d.properties["Qty"]; });
        // console.log(maxVolume);
        
        usaTop10.forEach( function(d,i) {
            var flow1 = g
                .append("path")
                .attr("d", line(d.geometry.coordinates))
                .attr("class", "flow-line")
                .style("stroke", getColor(flow)) 
                .attr("stroke-opacity", Math.sqrt(d.properties["Qty"] / maxVolume) )
                .attr("stroke-width", 5);
            // console.log(d.properties["Qty"])
            // console.log(Math.sqrt(d.properties["Qty"]))
            // console.log(Math.sqrt(d.properties["Qty"] / maxVolume));
            var totalLength = flow1.node().getTotalLength() +10;

            flow1
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            // .on("start", drawPorts(d) )
            .attr("stroke-dashoffset", 0);
        });

        // // v1 inspired by: https://stackoverflow.com/questions/56562231/line-on-d3-map-not-forming-a-curve
        // var fauxArcPaths = svg.selectAll(null)
        //     .data(usaTop10)
        //     .enter()
        //     .append("path")
        //     .datum(function(d) {
        //         return d.geometry.coordinates;
        //         // return [d.source,d.destination];
        //     })
        //     .attr("class", "flow-line")
        //     .attr("d",line)
        //     .style("stroke", getColor(flow)) 
        //     .style("stroke-width",1)
        //     .call(lineTransition);
    });
    // enableRotation();
};

// d3.json(`./data/oil_country_flows_exports.geojson`, function(error, expoJson) {
//     console.log(expoJson);
//     var features = expoJson.features;
//     console.log(features);
    
//     var usa10Export = features.filter(getUSA)
//                         .sort((a, b) => b.properties["Qty"] - a.properties["Qty"])
//                         .slice(0,10);
    
//     console.log(usa10Export);

//     // L.geoJSON(usa10Export).addTo(mapLeaflet);

//     var fauxArcPaths = svg.selectAll(null)
//     .data(usa10Export)
//     .enter()
//     .append("path")
//     .datum(function(d) {
//         return d.geometry.coordinates;
//         // return [d.source,d.destination];
//     })
//     .attr("d",line)
//     .style("stroke","red")
//     .style("stroke-width",1)
//     .call(lineTransition);
// });

// d3.json("./data/oil_country_flows_imports.geojson", function(error, importJson) {
//     console.log(importJson);
//     var featuresImport = importJson.features;
//     console.log(featuresImport);
    
//     var usa10Import = featuresImport.filter(getUSA)
//                         .sort((a, b) => b.properties["Qty"] - a.properties["Qty"])
//                         .slice(0,10);
    
//     console.log(usa10Import);

//     // L.geoJSON(usa10Import).addTo(mapLeaflet);
//     console.log(usa10Import[2].geometry)


//     ///////////////////////////////////////////////////////
//     //////////////////////////////////////////////////////
//     // source: https://stackoverflow.com/questions/56562231/line-on-d3-map-not-forming-a-curve 
    
//     var fauxArcPaths = svg.selectAll(null)
//         .data(usa10Import)
//         .enter()
//         .append("path")
//         .datum(function(d) {
//             return d.geometry.coordinates;
//            })
//         .attr("d",line)
//         .style("stroke","black")
//         .style("stroke-width",1)
//         .call(lineTransition);

// });

drawGlobe();


  
 