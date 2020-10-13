// 1. define variables needed
// svg size
var width = 960,
    height = 480;

//var svg = d3.select('svg');
// define svg location on the website
var svg = d3.select("#worldMap")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// var for projection type
var projection = d3.geoNaturalEarth1();
  //.center([0, -29])
  //.rotate([-24,0])
  //.scale(2000)
  //.translate([width / 2, height / 2]);

// DOPLN TEXT based on the video
var pathGenerator = d3.geoPath().projection(projection);

//empty array for holding all values for later
var dataValues = [];
var years = [];
var yearIndex = 0;
    
// colors from https://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=5
// var colors = ["#f9ddda", "#eda8bd",  "#ce78b3", "#9955a8", "#573b88"]; // pink
// var colors = ['#ffffcc','#a1dab4','#41b6c4','#2c7fb8','#253494']; // yellow to blues
// var colors = ['#2c7bb6','#abd9e9','#ffffbf','#fdae61','#d7191c']; // red -> yellow -> blue
var colors = ['#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027'] // my selection 7 colors blue->yellow->red

// function to take a number and output a color
var colorize = d3.scaleThreshold()
  .range(colors);

var playing = false;

// 2. LOAD ALL DATA AND AWAIT THE NEXT STEP
d3.queue()   // queue function loads all external data files asynchronously 
  .defer(d3.tsv, 'data/110m.tsv')
  .defer(d3.json, 'data/world-topo.json')  // our geometries, does not work with latest version of topojson countries data, probably different structure of data?
  .defer(d3.csv, 'data/countriesRandom.csv')  // and associated data in csv file
  .await(processData); 

// INITIATE THE PAGE
// function init() {
//     processData();
// };

// FUNCTION TO PROCESS DATA WE LOADED
function processData(err, tsvFile, world, countryData) {
    //console.log('tsvFile:');
    //console.log(tsvFile);
    //console.log('jsonFile:')
    console.log(world);
    //console.log('dataset:')
    //console.log(dataSet);

    countryName = {}; // creating empty object where key will be our id for a country and value will be a name of the country
    tsvFile.forEach(d=>  {
        countryName[d.iso_a3] = d.name
    });
    
    
    //var countries = topojson.feature(world, world.objects.countries)
    var countries = world.objects.countries.geometries; // store path in variable for ease

    for (var i in countries) { // looping through each geometry object
        for (var j in countryData) { // looping through each row of csv file
            if(countries[i].properties.id == countryData[j].id) {   //if ids match
                for(var k in countryData[j]) { // looping through each column in a row in csv file, should be maybe countryData[j], it is [i] in the source code, it seems to be ok, and same
                    if(k != 'name' && k != 'id') {  //skipping columns id and name from csv as we already have them
                        if(years.indexOf(k) == -1) {
                            years.push(k); // add new column headings to our array for later
                        }
                        countries[i].properties[k] = Number(countryData[j][k]); // add CSV colum key/value to geometry object
                        dataValues.push(+countryData[j][k]); // add each value to an array for further use (coloring)
                    }
                }
                break; //stop looking through csv as we made a match
            }
        }
    };
    console.log('years:'+years);
    console.log(countries);
    console.log(dataValues)
    // loop through topoJSON (geoms) file - features
    // countries.features.forEach(function(geom) {

    //     // loop through csv file
    //     dataSet.forEach(function(data) {
    //         // find data based on the id match
    //         if(geom.properties.id = data.id) {

    //             //loop through all years
    //             for(var datum in data) {
    //                 // if isn't id code
    //                 if (datum !='id') {
    //                     // add CSV data to geom properties
    //                     geom.properties[datum] = +data[datum]; // converting from string to number

    //                     dataValues.push(+data[datum]);
    //                 }
    //             }
    //         }
    //     })
    // });
    //console.log(dataValues);
    // it can be replaced by 'reduce' function

    // determine cluster arrays from data values - PRAVDEPODOBNE MUSIME REPLACE dataVAlues niecim inym
    var clusters = ss.ckmeans(dataValues, 7);

    var breaks = clusters.map(function(cluster){
       // return the last element of the cluster array
       return cluster.pop();
    });

    // remove last array item for colorize domain
    breaks.splice(-1,1);

    // update colorize function with domain values
    colorize.domain(breaks);

    drawMap(world);
};

// function setMap() {
//     var svg = d3.select("#worldMap").append("svg")   // append a svg to our html div to hold our map
//     .attr("width", width)
//     .attr("height", height);

//     var g = svg.append('g');

//     g.selectAll("path")
//      .data(countries.features)
//      .enter().append("path")
//                  .attr('class', 'country')
//                  .attr("d", pathGenerator) //pathGenerator =  d => pathGenerator(d)
//                  .attr('fill', 'green')
//             .append('title') // to have a popup with the name of the country we need to append additional child element to svg calle title and then append a text to it that will be showing up
//                  .text(d => d.properties.name ); 

//     loadData()
// };


// read data from topojson file and create the basic map
// Use d.name for title
// Use d.iso_a3/d.iso_n3 for id

//console.log(countries);

// FUNCTION TO CREATE AND DRAW AN INITIAL MAP:
function drawMap (world) {
    var g = svg.append('g');
    
    g.append('path')
        .attr('class', 'sphere')
        .attr('d', pathGenerator({type: 'Sphere'}));

    svg.call(d3.zoom().on('zoom', () => {
        g.attr('transform', d3.event.transform);
    }))
    
    var countries = topojson.feature(world, world.objects.countries)
    
    // connect data and draw a map
    g.selectAll('path')
        .data(countries.features)
        .enter().append('path')
            .attr('class', 'country') // assigning class
            .attr('d', pathGenerator)  // pathGenerator: is same as d => pathGenerator(d)
        .append('title')
            .text(d => countryName[d.properties.id] + ': ' + d.properties[years[yearIndex]]);
    
    //FUNCTION for monochrome Choropleth coloring
    // var dataRange = getDataRange(); // get the min/max values from the current year's range of data values
    // d3.selectAll('.country')  // select all the countries
    //     .attr('fill-opacity', function(d) {
    //         return getColor(d.properties[years[yearIndex]], dataRange);  // give them an opacity value based on their current value
    //     });

    // call to color map with initial/min value
    updateMap(d3.select("#sequence").attr("min"));

    //append legend:
    //console.log('year: ' + d3.select("#sequence").attr("min"));
    
};

function updateMap(year) {
    // select all the countries
    d3.selectAll('.country')
        .attr("fill", function(d){
            if(d.properties[year] != undefined) {
                return colorize(d.properties[year]);
            } else {
                // something wrong with data
                return 'lightgray'
            }
            
        });
};

(function() {
    // select the output 
    var output = d3.select("#output");

    // select range
    d3.select('#sequence')
        .on('input', function(d) { // when it changes
            updateMap(+this.value); // update  the map
            output.html(+this.value)  // update the output
        });
})();

function animateMap() {

    var timer;  // create timer object
    d3.select('#play')  
      .on('click', function() {  // when user clicks the play button
        console.log('click');
        if(playing == false) {  // if the map is currently playing
          timer = setInterval(function(){   // set a JS interval
            if(yearIndex < years.length-1) {  
                yearIndex +=1;  // increment the current attribute counter
            } else {
                yearIndex = 0;  // or reset it to zero
            }
            updateMap(years[yearIndex]);  // update the representation of the map 
            d3.select('#output').html(years[yearIndex]);  // update the clock
          }, 600); // 600 is the interval for change
        
          d3.select(this).html('stop');  // change the button label to stop
          playing = true;   // change the status of the animation
        } else {    // else if is currently playing
          clearInterval(timer);   // stop the animation by clearing the interval
          d3.select(this).html('play');   // change the button label to play
          playing = false;   // change the status again
        }
    });
  }
animateMap();
// FUNCTION for monochrome Choropleth coloring
// function getColor(valueIn, valuesIn) {

//     var color = d3.scaleLinear() // create a linear scale
//       .domain([valuesIn[0],valuesIn[1]])  // input uses min and max values
//       .range([.3,1]);   // output for opacity between .3 and 1 %
  
//     return color(valueIn);  // return that number to the caller
// };

// FUNCTION for monochrome Choropleth coloring
// function getDataRange() {
//     // function loops through all the data values from the current data attribute
//     // and returns the min and max values
  
//     var min = Infinity, max = -Infinity;  
//     d3.selectAll('.country')
//       .each(function(d,i) {
//         var currentValue = d.properties[years[yearIndex]];
//         if(currentValue <= min && currentValue != -99 && currentValue != 'undefined') {
//           min = currentValue;
//         }
//         if(currentValue >= max && currentValue != -99 && currentValue != 'undefined') {
//           max = currentValue;
//         }
//     });
//     return [min,max];  //boomsauce
// };




//init();

// function processData(err, geoms, dataSet){

//     console.log('geoms:');
//     console.log(geoms);
//     console.log('dataSet:');
//     console.log(dataSet);

//     // empty array for holding all values for later
//     // classifying data
//     var dataValues = [];

//     // loop through your geometry features
//     geoms.features.forEach(function(geom){
        
//         // loop through CSV data
//         dataSet.forEach(function(data){

//             // if they match
//             if(geom.properties.id === data.id){

//                 // loop through all years
//                 for(var datum in data){
//                     // if isn't id code
//                     if (datum != "id") {
//                         // add CSV data to geom properties
//                         geom.properties[datum] = +data[datum]; // convert from string to number

//                         // push value to our array
//                         dataValues.push(+data[datum]);
//                     }
//                 }
//             }
//         })
//     });

//     // determine cluster arrays from data values
//     var clusters = ss.ckmeans(dataValues, 5);

//     var breaks = clusters.map(function(cluster){
//         // return the last element of the cluster array
//         return cluster.pop();
//     });

//     // remove last array item for colorize domain
//     breaks.splice(-1,1);

//     // update colorize function with domain values
//     colorize.domain(breaks);

//     // send updated geoms to be drawn
//     drawMap(geoms);
// }

// function drawMap(geoms) {

//     // append a g to the svg, use data from geoms
//     // and path generator to draw map
//     svg.append("g")
//        .selectAll("path")
//        .data(geoms.features)
//        .enter()
//        .append("path")
//        .attr("d", pathGenerator)
//        .attr("class", "region");
        
//     // call to color map with initial/min value
//     updateMap(d3.select("#sequence").attr("min"));
// }

// function updateMap(year) {
//     // select all the regions
//     d3.selectAll('.region')
//        .attr("fill", function(d){
//            if(d.properties[year] != undefined) {
//                 return colorize(d.properties[year]);
//           } else {
//                 // something wrong with data
//                     return 'lightgray'
//                 }
                
//             });
//     }

//     // IIFE to attach listeners to range UI
//     (function() {
//         // select the output 
//         var output = d3.select("#output");

//         // select range
//         d3.select('#sequence')
//             .on('input', function(d) { // when it changes
//                 updateMap(+this.value); // update  the map
//                 output.html(+this.value)  // update the output
//             });
//     })();

    // init();
//})();
