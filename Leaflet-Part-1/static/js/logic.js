var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// invoke above endpoint using the d3 function
d3.json(url).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

function createFeatures(featuresData) {
    // use the geoJson response and create popup details with place, time, magnitude and coordinates
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
    // create the earthquake layer - circles to show on the map
    var earthquakeLayer = L.geoJSON(featuresData, {
        onEachFeature: onEachFeature,

        pointToLayer: function (feature, latlng) {
            var markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "black",
                stroke: true,
                weight: 0.5
            }
            return L.circle(latlng, markers);
        }
    });

    createMap(earthquakeLayer);
};

// Function to determine marker size
function markerSize(magnitude) {
    return magnitude * 20000;
};

// Function to determine marker color by depth
function chooseColor(depth) {
    if (depth < 10) return "#00FF00";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "orangered";
    else return "#FF0000";
}

function createMap(earthquakeLayer) {

    // Create tile layer
    var openStreetMapTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create our map, giving it the grayscale map and earthquakes layers to display on load.
    var myMap = L.map("map", {
        center: [
            39.1, -98.5
        ],
        zoom: 4.5,
        layers: [openStreetMapTiles, earthquakeLayer]
    });

    // Add legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            labels = ["<div style='background-color: white'></div>"];
        categories = ['-10-10', ' 10-30', ' 30-50', ' 50-70', ' 70-90', '+90'];
        colors = ["#00FF00", "greenyellow", "yellow", "orange", "orangered", "#FF0000"];
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML += labels.push(
                '<li style="background:' + colors[i] + '"><span>' + categories[i] + '</span></li>'
            );
        }
        div.innerHTML = '<ul style="list-style-type:none; text-align: center">' + labels.join('') + '</ul>'
        return div;
    };
    legend.addTo(myMap);
};