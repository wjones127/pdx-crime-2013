var d3 = require('d3');
var tip = require('d3-tip');
tip(d3);
require('./filter_form');

// Accessor functions for later
var a = {};

var curr_filters = {type: 'All'};

// Get plotting functions
var geoPlot = require('./geo-plot');
var datePlot = require('./date-plot');
var timePlot = require('./time-plot');

// Maps
var map, heatmap;

// Getting the data
d3.json('data/crime2013Clean.geojson', initPlot);

function initPlot(error, data) {
    if (error) {
        console.error("Data didn't come in! D:");
        return null;
    }
    // Accessor functions
    a.time = function (d) { return d.properties.time; };
    a.type = function (d) { return d.properties.type; };
    // Convert dates and times
    data.features = data.features.map(addDateTimes);
    function addDateTimes (d) {
        d.properties.time = new Date('1/1/2013 ' + a.time(d));
        return d;
    }
    // Convert the coordinates to floats
    data.features = data.features.map(coordToFloat);
    function coordToFloat (d) {
        d.geometry.coordinates[0] = parseFloat(d.geometry.coordinates[0]);
        d.geometry.coordinates[1] = parseFloat(d.geometry.coordinates[1]);
        return d;
    }
    console.log(data.features[0]);
    // Get list of crime types
    var crime_types = d3.set(data.features.map(a.type))
            .values()
            .sort();
    d3.select('#type-selector')
        .selectAll('option')
        .data(crime_types)
        .enter()
        .append('option')
        .html(function (d) { return d; });
    document.getElementById('type-selector')
        .addEventListener('change', typeFilterUpdate);

    function typeFilterUpdate() {
        filterUpdateMap({type: this.value});
    }

    // Initialize the plots
    map = new google.maps.Map(document.getElementById('map'),
                                  { zoom : 11,
                                    center : { lat : 45.5424364,
                                               lng : -122.654422 }
                                  });
    timePlot.init(data.features, a, filterUpdateMap);
    filterUpdateMap({ type : crime_types[0] });





    /**
     * Updates the map with new filters.
     */
    function filterUpdateMap(options) {
        curr_filters.startTime = options.startTime || curr_filters.startTime;
        curr_filters.endTime = options.endTime || curr_filters.endTime;
        curr_filters.type = options.type || curr_filters.type;
        function hasType(d) {
            // if (curr_filters.type === 'All') return true;
            return a.type(d) === curr_filters.type;
        }
        function inTimeRange(d) {
            return +curr_filters.startTime <= +a.time(d) &&
                +a.time(d) <= +curr_filters.endTime;
        }
        var new_features = data.features.filter(hasType);

        if (options.type !== undefined)
            timePlot.plot(new_features, a);

        // But geo plot can get any filter
        if (curr_filters.startTime !== undefined)
            new_features = new_features.filter(inTimeRange);

        var shell = { type : 'FeatureCollection',
                      properties : ''};

        shell.features = new_features;

        //geoPlot.plot(shell, a);
        /*
        map.data.forEach(function (feature) {
            map.data.remove(feature);
        });
        map.data.addGeoJson(shell);
         */
        var hp_data = [];
        for (var i = 0; i < new_features.length; i++)
            hp_data.push(new google.maps.LatLng(new_features[i].geometry.coordinates[1],
                                                new_features[i].geometry.coordinates[0]));

        if (heatmap !== undefined)
            heatmap.setMap(null);
        heatmap = new google.maps.visualization.HeatmapLayer({
            data : hp_data
        });

        heatmap.setMap(map);
    }
}



