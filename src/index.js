var d3 = require('d3');
require('./filter_form');

// Accessor functions for later
var a = {};

// Get plotting functions
var geoPlot = require('./geo-plot');
var datePlot = require('./date-plot');

// Getting the data
d3.json('data/crime2013.json', initPlot);

function initPlot(error, data) {
    if (error) {
        console.error("Data didn't come in! D:");
        return null;
    }
    // Accessor functions
    a.x = function(d) { return parseFloat(d['X Coordinate']); };
    a.y = function(d) { return parseFloat(d['Y Coordinate']); };
    a.date = function (d) { return d['Report Date']; };
    a.time = function (d) { return d['Report Time']; };
    a.type = function (d) { return d['Major Offense Type']; };
    // Filter out data without locations
    function hasLocation(d) {
        return a.x(d) !== '';
    }
    data = data.filter(hasLocation);
    // Convert dates and times
    data = data.map(addDateTimes);
    function addDateTimes (d) {
        d['Report Date'] = new Date(a.date(d) + ' ' + a.time(d));
        d['Report Time'] = new Date('1/1/2013 ' + a.time(d));
        return d;
    }
    console.log(data[0]);
    // Get list of crime types
    var crime_types = d3.set(data.map(a.type))
            .values()
            .sort();
    d3.select('#type-selector')
        .selectAll('option')
        .data(crime_types)
        .enter()
        .append('option')
        .html(function (d) { return d; });
    document.getElementById('type-selector')
        .addEventListener('change', filterUpdate);
    function filterUpdate() {
        var selected_type = this.value;
        function hasType(d) {
            return a.type(d) === selected_type;
        }
        var new_data = data.filter(hasType);
        geoPlot.plot(new_data, a);
        datePlot.plot(new_data, a);
    }
    // Initialize the plots
    geoPlot.init(data, a);
    datePlot.init(data, a);
    // timePlot.init(data);
}

