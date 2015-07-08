var d3 = require('d3');
require('./filter_form');

// Plot Config variables
var svg, xScale, yScale, typeScale;
var x, y, date, type; // Accessor functions for later
// Plot config
var width = 1000,
    height = 800,
    margin = 50;

// Getting the data
d3.json('data/crime2013.json', initPlot);

function initPlot(error, data) {
    if (error) {
        console.error("Data didn't come in! D:");
        return null;
    }
    // Accessor functions
    x = function(d) { return parseFloat(d['X Coordinate']); };
    y = function(d) { return parseFloat(d['Y Coordinate']); };
    date = function (d) { return d['Report Date']; };
    type = function (d) { return d['Major Offense Type']; };
    // Filter out data without locations
    function hasLocation(d) {
        return x(d) !== '';
    }
    data = data.filter(hasLocation);
    // Get list of crime types
    var crime_types = d3.set(data.map(type))
            .values()
            .sort();
    d3.select('#type-selector')
        .selectAll('option')
        .data(crime_types)
        .enter()
        .append('option')
        .html(function (d) { return d; });
    // Creating a plot
    svg = d3.select('#plot');
    svg.attr({ width : 1000,
               height: 800 });
    xScale = d3.scale.linear().domain(d3.extent(data, x))
        .range([margin, width - margin]);
    yScale = d3.scale.linear().domain(d3.extent(data, y))
        .range([height - margin, margin]);
    typeScale = d3.scale.category10();
    plotData(data);
}

function plotData(data) {
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr({cx : function (d) { return xScale(x(d)); },
               cy : function (d) { return yScale(y(d)); },
               r : 2,
               fill : function (d) { return typeScale(type(d)); }
              });
}
