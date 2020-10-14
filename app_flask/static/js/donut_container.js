
            <svg id="chart" preserveAspectRatio="xMinYMin meet" viewBox="-30 0 260 200"></svg>
            <div class="text-right" >
            <button onclick="draw()">World/USA</button>

let data = [48, 21, 65, 30, 16, 2];
let colors = colorbrewer.Dark2[data.length];

let sizes = {
  innerRadius: 50,
  outerRadius: 100
};

let durations = {
  entryAnimation: 2000
};

draw();

function draw() {
  d3.select("#chart").html("");

  let generator = d3.pie()
    .sort(null);

  var pie = d3.pie()
    .value(function(d) {return d.value; });

  var data_ready = pie(d3.entries(data));
  console.log(data_ready);

  let chart = generator(data);

  let arcs = d3.select("#chart")
    .append("g")
    .attr("transform", "translate(100, 100)")
    .selectAll("path")
    .data(chart)
    .enter()
    .append("path")
    .style("fill", (d, i) => colors[i]);

  let angleInterpolation = d3.interpolate(generator.startAngle()(), generator.endAngle()());

  let innerRadiusInterpolation = d3.interpolate(0, sizes.innerRadius);
  let outerRadiusInterpolation = d3.interpolate(0, sizes.outerRadius);

  let arc = d3.arc();

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  var radius = Math.min(200, 200) / 2;

  // The arc generator
  var innerArc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)

  // Another arc that won't be drawn. Just for labels positioning
  var outerArc = d3.arc()
    .innerRadius(radius * 0.8)
    .outerRadius(radius * 0.9)

  arcs.transition()
    .duration(durations.entryAnimation)
    .attrTween("d", d => {
      let originalEnd = d.endAngle;
      return t => {
        let currentAngle = angleInterpolation(t);
        if (currentAngle < d.startAngle) {
          return "";
        }

        d.endAngle = Math.min(currentAngle, originalEnd);

        return arc(d);
      };
    });

  d3.select("#chart")
    .transition()
    .duration(durations.entryAnimation)
    .tween("arcRadii", () => {
      return t => arc
        .innerRadius(innerRadiusInterpolation(t))
        .outerRadius(outerRadiusInterpolation(t));
    });

    // Add the polylines between chart and labels:
  d3.select("#chart")
    .selectAll('allPolylines')
    .data(data_ready)
    .enter()
    .append('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', function(d) {
        var posA = innerArc.centroid(d) // line insertion in the slice
        var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        console.log(posA, posB, posC);
        return [posA, posB, posC]
      })
      // Add the polylines between chart and labels:
  d3.select("#chart")
    .selectAll('allLabels')
    .data(data_ready)
    .enter()
    .append('text')
      .text( function(d) { console.log(d.data.key) ; return d.data.key } )
      .attr('transform', function(d) {
          var pos = outerArc.centroid(d);
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
      })
      .style('text-anchor', function(d) {
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          return (midangle < Math.PI ? 'start' : 'end')
      })
}
