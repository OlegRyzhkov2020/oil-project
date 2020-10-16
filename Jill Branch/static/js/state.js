//Define geojson data
states = "static/data/US_State_Borders.json"
consumption = "static/data/db_json.geojson"

// Initialize & Create Two Separate LayerGroups
var stateLayer = new L.LayerGroup();
var consumption_Layer = new L.LayerGroup();


// Define variables for our tile layers

var greyscale =  L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});


// Only one base layer can be shown at a time
var baseMaps = {
  "Greyscale": greyscale 
};

// Overlays that may be toggled on or off
var overlayMaps = {
    "States": stateLayer,
    "Oil Consumption": consumption_Layer
};  

// Create map object and set default layers
var myMap = L.map("map", {
    center: [37.8, -96],
    zoom: 4,
    layers: [greyscale,stateLayer]
});


// Create a control for our layers, add our overlay layers to the map with default tile
L.control.layers(baseMaps, overlayMaps,{position: "bottomleft"}).addTo(myMap);
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}
function stateStyle(feature) {
    return {
        fillColor: stateColor(feature.properties.CENSUSAREA),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
function stateColor(d) {
    return d > 100000 ? '#800026' :
           d > 80000  ? '#BD0026' :
           d > 60000  ? '#E31A1C' :
           d > 40000  ? '#FC4E2A' :
           d > 20000  ? '#FD8D3C' :
           d > 15000   ? '#FEB24C' :
           d > 10000   ? '#FED976' :
                      '#FFEDA0';
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}
var geojson;
geojson = d3.json(states, function(statesData) {
    L.geoJSON(statesData, {
        style: stateStyle,
        onEachFeature: onEachFeature
                // layer.bindPopup("<h4> State: " + feature.properties.NAME);
        
    //Add oilData to oil_and_natural_gas_Layer    
    }).addTo(myMap);
    //Add stateLayer to myMap
    // stateLayer.addTo(myMap);
}); 
function getColor(d) {
    return d > 1000000 ? '#800026' :
           d > 500000  ? '#BD0026' :
           d > 300000  ? '#E31A1C' :
           d > 120000  ? '#FC4E2A' :
           d > 80000   ? '#FD8D3C' :
           d > 50000   ? '#FEB24C' :
           d > 1000   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.consumption),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
d3.json(consumption, function(consumptionData) {
    L.geoJSON(consumptionData, {
        pointToLayer: function(feature, coordinates) {
            return L.circleMarker(coordinates);},
            style: style,
            // Function to Run Once For Each feature in the features Array
            // Give Each feature a Popup Describing the Place & Time of the Earthquake
            onEachFeature: function(feature, layer) {
                layer.bindPopup("<h4> State Oil Consumption: " + feature.properties.Year);
            }
    //Add oilData to oil_and_natural_gas_Layer    
    }).addTo(consumption_Layer);
    //Add stateLayer to myMap
    // consumption_Layer.addTo(myMap);
}); 
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,10000, 15000, 20000, 40000, 60000, 80000, 100000],
        labels = ["<strong>State Census Area</strong>"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

