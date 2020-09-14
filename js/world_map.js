// Load countries json data
map_container = d3.select("#world_map")

d3.csv("outputs/product_2019.csv", function(data) {
  const dataSet = data;
  d3.json("json/countries.geo.json", function(data) {
    const geometrySet = data;
    mapData(dataSet, geometrySet);
  })
});

function mapData(data, mapInfo) {
  let dataIndex = {};
  for (let c of data) {
    let country = c.country;
    dataIndex[country] = +c.production;
  }

  mapInfo.features = mapInfo.features.map(d => {
    let country = d.properties.name;
    let production = dataIndex[country];
    d.properties.Production = production;
    return d;
  })
  console.log(mapInfo);

  let maxProduction = d3.max(mapInfo.features, d=>
      d.properties.Production);
  let meanProduction = d3.mean(mapInfo.features, d=>
      d.properties.Production);
  let cScale = d3.scaleLinear()
    .domain([0, meanProduction, maxProduction])
    .range(["white", "orange", "red"])


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
    .attr("fill",
        d => cScale(d.properties.Production));

    // load and display the World
    //d3.json("json/world-110m2.json", function(error, topology) {
      //g.selectAll("path")
      //.data(topojson.object(topology, topology.objects.countries)
        //  .geometries)
      //.enter()
      //.append("path")
      //.attr("d", path)
    //});

};
