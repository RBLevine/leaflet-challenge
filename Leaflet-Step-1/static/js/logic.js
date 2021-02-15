// Store API endpoint inside query URL
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// GET request to query URL
d3.json(earthquakeURL, function(data){
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer){
            // Gives each feature a popup with magnitude, place, time
            layer.bindPopup("<h3>Magnitude: "+feature.properties.mag+"</h3><h3>Location: "+feature.properties.place+"</h3><hr><p>"+new Date(feature.properties.time)+"</p>");

        },

        pointToLayer: function(feature, latlng){
            return new L.circle(latlng,
                {radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                fillOpacity: .7,
                color: "#000000",
                stroke: true,
                weight: .5
            })
        }
    });
    createMap(earthquakes);

};

function createMap(earthquakes) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.outdoors',
        accessToken: API_KEY
    });

    var grayscale = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 20,
        id: 'mapbox.light',
        accessToken: API_KEY
    });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Satellite": satellite,
        "Outdoors": outdoors,
        "Grayscale": grayscale
    };

    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create the map object with options
    var myMap = L.map("mapid", {
        center: [30, -30],
        zoom: 2,
        layers: [lightmap, earthquakes]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5],
        labels=[];

        for(var i = 0; i<grades.length; i++){
            div.innerHTML +='<i style="background:'+getColor(i)+'"></i>'+grades[i]+(grades[i+1] ? '&ndash;'+grades[i+1]+'<br>':'+');
        }
        return div;
    };
    legend.addTo(myMap);

}

function getRadius (magnitude){
    return magnitude*30000;
};

function getColor(magnitude){
    if (magnitude>=5){
        return '#660000'
    } 
    else if (magnitude>=4){
        return '#6F3E0C'
    }
    else if (magnitude>=3){
        return '#6C6A17'
    }
    else if (magnitude>=2){
        return '#609251'
    }
    else if (magnitude>=1){
        return '#50B796'
    }
    else{
        return '#5AD8DE'
    }
};

