//Define geojson data
states = "static/data/US_State_Borders.json"
petrolium_ports = "static/data/Petroleum_Ports.geojson"
oil_refineries = "static/data/Oil_Refineries.geojson"
oil_and_natural_gas = "static/data/Oil_and_Natural_Gas_Platforms.geojson"
crude_pipeline = "static/data/global_oil_pipelines_7z9.json"
oil_gas_fields = "static/data/Oil_and_Natural_Gas_Fields.geojson"
consumption = "static/data/db_json.geojson"
petrolium_ports_json = "static/data/petrolium_ports.json"

// Initialize & Create Separate LayerGroups
var stateLayer = new L.LayerGroup();
var petrolium_ports_Layer = new L.markerClusterGroup();
var oil_refineries_Layer = new L.LayerGroup();
var oil_and_natural_gas_Layer = new L.LayerGroup();
var crude_pipeline_Layer = new L.LayerGroup();
var oil_gas_fields_Layer = new L.LayerGroup();


// Define variables for our tile layers

var greyscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
});


// Only one base layer can be shown at a time
var baseMaps = {
    "Greyscale": greyscale,
    "Outdoors": outdoors

};
// Overlays that may be toggled on or off
var overlayMaps = {
    "Petrolium Ports": petrolium_ports_Layer,
    "Oil Refineries": oil_refineries_Layer,
    "Oil & Gas Platforms": oil_and_natural_gas_Layer,
    "States": stateLayer,
    "Crude Pipelines": crude_pipeline_Layer,
    "Oil & Gas Fields": oil_gas_fields_Layer
};

// Create map object and set default layers
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [outdoors, oil_refineries_Layer]
});


// Create a control for our layers, add our overlay layers to the map with default tile
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// var markers;


// Define a markerSize function that will give each city a different radius based on its population
function markerSize(ranking) {
    switch (true) {
        case ranking > 140:
            return radius = 3;
        case ranking > 100:
            return radius = 4;
        case ranking > 60:
            return radius = 5;
        case ranking > 20:
            return radius = 6;
        case ranking > 10:
            return radius = 8;
        case ranking > 5:
            return radius = 12;
        case ranking > 0:
            return radius = 18;
        case ranking < 0:
            return radius = 2;
    }

}
//Define a marker color function based on status of oil refineries (inservice or closed)

function markerColor(US_RANK) {
    switch (true) {
        case US_RANK > 140:
            //Magenta color
            return "#acace6";
        case US_RANK > 100:
            //Reddish purple
            return "#c71585";
        case US_RANK > 60:
            //Red
            return "#0000ff";
        case US_RANK > 20:
            //Reddish orange
            return "#ffae42";
        case US_RANK > 0:
            //Bright Red
            return "#ff0000";
        default:
            //Yellow
            return "#ADFF2F";
    }
};
//Set up marker style based on oil refineries USA ranking
function markerStyle(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: markerColor(feature.properties.US_RANK),
        color: "#000000",
        radius: markerSize(feature.properties.US_RANK),
        stroke: true,
        weight: 0.5
    };
}
//Set up marker style based on state consumption/production
function stateMarkerStyle(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: "ADF22F",
        color: "ADF22F",
        radius: 5,
        stroke: true,
        weight: 0.5
    };
}
function portMarkerStyle(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: "#4169E1",
        color: "#000000",
        riseOnHover: true,
        stroke: true,
        weight: 0.5
    };
}
function platformMarkerStyle(feature) {
    return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: "#ffa500",
        color: "#000000",
        radius: 5,
        stroke: true,
        weight: 0.5
    };
}


// Retrieve data needed to create layers  with D3
d3.json(oil_refineries, function (oil_ref_Data) {
    L.geoJSON(oil_ref_Data, {
        pointToLayer: function (feature, coordinates) {
            return L.circleMarker(coordinates);
        },
        style: markerStyle,

        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup Describing the Place & Time of the Earthquake
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h4>Oil Refinery Name: " + feature.properties.NAME +
                "</h4><hr><p>Address: " + feature.properties.ADDRESS +
                "</p><hr><p>OWNER: " + feature.properties.OWNER + "</p>" +
                "<hr><p>Capacity: " + feature.properties.CAPACITY + "</p>" +
                "<hr><p>USA Ranking: " + feature.properties.US_RANK + "</p>");
        }
        // Add oil_ref_Data to oil_refineries_Layer
    }).addTo(oil_refineries_Layer);
    //Add oil_refineries_Layer to myMaps
    oil_refineries_Layer.addTo(myMap);

    // Set Up Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            labels = ["<strong>Refinery Ranking</strong>"]
        rankingLevels = [0, 20, 60, 100, 140];

        div.innerHTML += "<h3>Refinery Ranking</h3>"

        for (var i = 0; i < rankingLevels.length; i++) {
            div.innerHTML +=
                '<li style=\"background-color: ' + markerColor(rankingLevels[i] + 1) + '"></li> ' +
                rankingLevels[i] + (rankingLevels[i + 1] ? '&ndash;' + rankingLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add Legend to the Map
    legend.addTo(myMap);

});
//Retrieve petrolium_ports with D3
d3.json(petrolium_ports_json, function (portsData) {
    
    // Loop through data
    for (var i = 0; i < portsData.features.length; i++) {

        // Set the data location property to a variable
        var location = portsData.features[i].geometry;
        console.log(location);
        // Check for location property
        if (location) {

            // Add a new marker to the cluster group and bind a pop-up
            petrolium_ports_Layer.addLayer(L.marker([location.coordinates[1], location.coordinates[0]])
                .bindPopup("<h4>Name: " + portsData.features[i].properties.NAME +
                            "</h4><hr><p>Port Status: " + portsData.features[i].properties.STATUS +
                            "</p><hr><p>Port Source: " + portsData.features[i].properties.SOURCE + "</p>"));
        }
    }
    // console.log(petrolium_ports_Layer);
    myMap.addLayer(petrolium_ports_Layer);
    
});
//Retrieve oil_and_natural_gas data with D3
d3.json(oil_and_natural_gas, function (platformData) {
    L.geoJSON(platformData, {
        pointToLayer: function (feature, coordinates) {
            return L.circleMarker(coordinates);
        },
        style: platformMarkerStyle,
        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup Describing the Place & Time of the Earthquake
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h4>Operator Name: " + feature.properties.OPERNAME +
                "</h4><hr><p>Plaform Type: " + feature.properties.TYPE +
                "</p><hr><p>Water Depth: " + feature.properties.WATERDEPTH + "</p>");
        }
        //Add oilData to oil_and_natural_gas_Layer    
    }).addTo(oil_and_natural_gas_Layer);
    //Add oil_and_natural_gas_Layer to myMap
    // oil_and_natural_gas_Layer.addTo(myMap);
});
//Retrive state data with D3    
d3.json(states, function (statesData) {
    L.geoJSON(statesData, {
        pointToLayer: function (feature, coordinates) {
            return L.circleMarker(coordinates);
        },
        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup Describing the Place & Time of the Earthquake
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h4> State: " + feature.properties.NAME);
        }
        //Add oilData to oil_and_natural_gas_Layer    
    }).addTo(stateLayer);
    //Add stateLayer to myMap
    stateLayer.addTo(myMap);
});

//Retrieve crude_pipeline with D3
d3.json(crude_pipeline, function (pipelineData) {
    L.geoJSON(pipelineData, {
        color: "#DC143C",
        weight: 2
        //Add tectonicData to tectonicLayer    
    }).addTo(crude_pipeline_Layer);
    //Add tectoniLayer to myMap
    // crude_pipeline_Layer.addTo(myMap);
});
//Retrive oil_gas_fields data with D3    
d3.json(oil_gas_fields, function (oilGasFieldsData) {
    L.geoJSON(oilGasFieldsData, {
        color: "BEA493"
        //Add oilGasFieldsData to its Layer    
    }).addTo(oil_gas_fields_Layer);
    //Add oil_gas_fields_Layer to myMap
    // oil_gas_fields_Layer.addTo(myMap);
});


