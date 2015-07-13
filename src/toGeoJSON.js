/**
 * This file just cleans the geo json file, removing unnecessary properties.
 */

var fs = require('fs');

// Get the file
fs.readFile('data/crime2013.geojson', function (err, text) {
    processData(JSON.parse(text));
});



function processData(data) {
    // Create a new data set
    var geoData = [], geoPoint;
    for (var i = 0; i < data.features.length; i++) {
        // Add basic template
        geoPoint = {type : "Feature",
                    geometry : { type : "Point" },
                    properties : {}
                   };
        // Add location
        geoPoint.geometry.coordinates = data.features[i].geometry.coordinates;
        // Add time
        geoPoint.properties.time = data.features[i].properties['Report Time'];
        // Add type
        geoPoint.properties.type = data.features[i].properties['Major Offense Type'];
        // Add point to geoData
        geoData.push(geoPoint);
    }
    // Add basic structure
    var output = { type : 'FeatureCollection',
                   properties : 'urn:ogc:def:crs:OGC:1.3:CRS84' };
    output.features = geoData;
    // Now save the file as a json file
    fs.writeFile('data/crime2013Clean.geojson', JSON.stringify(output),
                 function (err) { if (!err) console.log('Finished'); });
}

