<svg id="chart" preserveAspectRatio="xMinYMin meet" viewBox="-30 0 260 200"></svg>
<div class="text-right" >
<button onclick="draw()">World</button>
</div>

<script>

let world_data = [48, 21, 65, 30, 16, 2];
let usa_data = [100, 10, 40, 70, 6, 20];
let labels_data = ["Petrol", "Gas", "Coal", "Nuclear Power", "Hydro", "Solar&Wind"]
let world_colors = colorbrewer.Dark2[world_data.length];
let usa_colors = colorbrewer.Dark2[usa_data.length];
var data, colors;
var data_button = true;

let sizes = {
  innerRadius: 50,
  outerRadius: 100
};

let durations = {
  entryAnimation: 2000
};

draw();

function draw() {

  if (data_button == true) {
    data = world_data;
    colors = world_colors;
    data_button = false;
  }
  else {
    data = usa_data;
    colors = usa_colors;
    data_button = true;
  }

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

	radius = Math.min(450, 450) / 2;

  // The arc generator
  var innerArc = d3.arc()
    .innerRadius(radius * 0.4)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)

  // Another arc that won't be drawn. Just for labels positioning
  var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)

  var key = function(d){ return d.data.key; };

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

  var svg = d3.select("#chart")
    .transition()
    .duration(durations.entryAnimation)
    .tween("arcRadii", () => {
      return t => arc
        .innerRadius(innerRadiusInterpolation(t))
        .outerRadius(outerRadiusInterpolation(t));
    });

  /* ------- TEXT LABELS -------*/
    var data_ready = pie(d3.entries(data));

  	var text = d3.select("#chart")
      .selectAll('allLabels')
      .data(data_ready, key)
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



      /* ------- SLICE TO TEXT POLYLINES -------*/

    	var polyline = d3.select("#chart").selectAll("polyline")
    		.data(data_ready);

    	polyline.enter()
    		.append("polyline");

    	polyline.transition()
        .duration(durations.entryAnimation)
    		.attrTween("points", function(d){
    			this._current = this._current || d;
    			var interpolate = d3.interpolate(this._current, d);
    			this._current = interpolate(0);
    			return function(t) {
    				var d2 = interpolate(t);
    				var pos = outerArc.centroid(d2);
    				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
    				return [arc.centroid(d2), outerArc.centroid(d2), pos];
    			};
    		});

    	polyline.exit()
    		.remove();

}
