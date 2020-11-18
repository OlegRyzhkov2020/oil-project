//Define geojson data
states = "static/data/State_Consumption.json"
consumption = "static/data/db_json.geojson"
console.log(states);

// Initialize & Create Two Separate LayerGroups
var stateLayer = new L.LayerGroup();

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
    "Oil Consumption by States": stateLayer
};  
// Create map object and set default layers
var myMap = L.map("map", {
    center: [37.8, -96],
    zoom: 4,
    layers: [greyscale,stateLayer]
});


// Create a control for our layers, add our overlay layers to the map with default tile
L.control.layers(baseMaps, overlayMaps,{position: "topright"}).addTo(myMap);

//Highlights states when hover over
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
//styles state colors based on consumption
function stateStyle(feature) {
    return {
        fillColor: stateColor(feature.properties.consumption),
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
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}
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

function stateStyle(feature) {
    return {
        fillColor: getColor(features.properties.consumption),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
console.log(states);

var geojson;
geojson = d3.json(states, function(statesData) {
    console.log(statesData);
    L.geoJSON(statesData, {
        style: stateStyle,
        onEachFeature: onEachFeature 
        //     layer.bindPopup("<h4> State: " + features.properties.NAME +
        //         "</p><hr><p>Oil Consumption: " + features.properties.consumption + "</p>");
        // }
    //Add oilData to oil_and_natural_gas_Layer    
    }).addTo(myMap);
    //Add stateLayer to myMap
    // stateLayer.addTo(myMap);
}); 