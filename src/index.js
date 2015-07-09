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
    a.id = function (d) { return d['Record ID']; };
    // Filter out data without locations
    function hasLocation(d) {
        return !isNaN(a.x(d));
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
        .addEventListener('change', typeFilterUpdate);

    function typeFilterUpdate() {
        console.log(data.length);
        filterUpdate({type: this.value});
    }
    

    // Initialize the plots
    geoPlot.init(data, a);
    datePlot.init(data, a, filterUpdate);
    // timePlot.init(data);

    function filterUpdate(options) {
        curr_filters.startDate = options.startDate || curr_filters.startDate;
        curr_filters.endDate = options.endDate || curr_filters.endDate;
        curr_filters.type = options.type || curr_filters.type;
        function hasType(d) {
            if (curr_filters.type === 'All') return true;
            return a.type(d) === curr_filters.type;
        }
        function inDateRange(d) {
            return +curr_filters.startDate <= +a.date(d) &&
                +a.date(d) && +curr_filters.endDate;
        }
        var new_data = data.filter(hasType);
        console.log(new_data.length);
        // Date plot is only filtered by type
        datePlot.plot(new_data, a);

        // But geo plot can get any filter
        new_data = new_data.filter(inDateRange);
        geoPlot.plot(new_data, a);


    }

}


