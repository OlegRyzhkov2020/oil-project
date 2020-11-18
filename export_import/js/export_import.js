// consider: rotating globe???
// https://bl.ocks.org/atanumallick/8d18989cd538c72ae1ead1c3b18d7b54
// https://gist.github.com/atanumallick/8d18989cd538c72ae1ead1c3b18d7b54

var height = 500;
var width = 960;

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
      // return projection (d.geometry.coordinates[0]);
      return projection (d)[0];
      // return projection ([d.lon,d.lat])[0];
  })
  .y(function(d) {
      // return projection (d.geometry.coordinates[1]);
      return projection (d)[1];
      // return projection ([d.lon,d.lat])[1];
  })
  .curve(curve)

var projection = d3.geoKavrayskiy7() //geoOrthographic()
    .scale(200)
    // .rotate([-205, -10])
    .translate([width/2, height/2])
    // .precision(0.1);

var path = d3.geoPath().projection(projection);

var svg = d3.select("#mapD3").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

/// line animation source:
// http://bl.ocks.org/erikhazzard/6201948
// https://stackoverflow.com/questions/18165533/how-to-draw-a-line-link-between-two-points-on-a-d3-map-based-on-latitude-lon

var lineTransition = function lineTransition(path) {
    path.transition()
    //NOTE: Change this number (in ms) to make lines draw faster or slower
    .duration(5500)
    .attrTween("stroke-dasharray", tweenDash)
    // .each("end", function(d,i) { 
        ////Uncomment following line to re-transition
        // d3.select(this).call(transition); 
                  
        //We might want to do stuff when the line reaches the target,
        //  like start the pulsating or add a new point or tell the
        //  NSA to listen to this guy's phone calls
        //doStuffWhenLineFinishes(d,i);
        // });
};
var tweenDash = function tweenDash() {
    //This function is used to animate the dash-array property, which is a
    //  nice hack that gives us animation along some arbitrary path (in this
    //  case, makes it look like a line is being drawn from point A to B)
    var len = this.getTotalLength(),
        interpolate = d3.interpolateString("0," + len, len + "," + len);

    return function(t) { return interpolate(t); };
};

function getUSA(feature) {
    return (feature.properties["Reporter ISO"] === "USA" &&
            feature.properties["Commodity"] === "PETROLEUM PRODUCTS");  //&&
            // feature.properties["Year"] == 2017);
};

d3.json("./data/countries-110m.json",function(error,world) {

    // var countries = topojson.feature(world, world.objects.countries)

    g.insert("path")
        .datum(topojson.feature(world, world.objects.countries))
        .attr("class", "land")
        .attr("d", path);


});

// this will be not needed, just file review
d3.json("./data/oil_country_summary_exports.geojson", function(error, worldExport) {
    console.log(worldExport);
})

// Creating our initial map object
// We set the longitude, latitude, and the starting zoom level
// This gets inserted into the div with an id of 'map'
var mapLeaflet = L.map("mapLeaflet", {
    center: [0, 0],
    zoom: 2
  });
  
  // Adding a tile layer (the background map image) to our map
  // We use the addTo method to add objects to our map
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(mapLeaflet);

d3.json("./data/oil_country_flows_exports.geojson", function(error, expoJson) {
    console.log(expoJson);
    var features = expoJson.features;
    console.log(features);
    
    

    var usa10Export = features.filter(getUSA)
                        .sort((a, b) => b.properties["Qty"] - a.properties["Qty"])
                        .slice(0,10);
    
    console.log(usa10Export);

    L.geoJSON(usa10Export).addTo(mapLeaflet);

    var fauxArcPaths = svg.selectAll(null)
    .data(usa10Export)
    .enter()
    .append("path")
    .datum(function(d) {
        return d.geometry.coordinates;
        // return [d.source,d.destination];
    })
    .attr("d",line)
    .style("stroke","red")
    .style("stroke-width",1)
    .call(lineTransition);
});

d3.json("./data/oil_country_flows_imports.geojson", function(error, importJson) {
    console.log(importJson);
    var featuresImport = importJson.features;
    console.log(featuresImport);
    
    

    var usa10Import = featuresImport.filter(getUSA)
                        .sort((a, b) => b.properties["Qty"] - a.properties["Qty"])
                        .slice(0,10);
    
    console.log(usa10Import);

    L.geoJSON(usa10Import).addTo(mapLeaflet);
    console.log(usa10Import[2].geometry)


    ///////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    // source: https://stackoverflow.com/questions/56562231/line-on-d3-map-not-forming-a-curve 
    
    var fauxArcPaths = svg.selectAll(null)
        .data(usa10Import)
        .enter()
        .append("path")
        .datum(function(d) {
            return d.geometry.coordinates;
           })
        .attr("d",line)
        .style("stroke","black")
        .style("stroke-width",1)
        .call(lineTransition);

});


  
 