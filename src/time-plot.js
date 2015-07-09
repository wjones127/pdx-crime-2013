var drag = require('./drag');

// Plot config
var svg, inner, endpoints, tScale, nScale;
var width = 1000,
    height = 250,
    margin = 50,
    innerH = height - 2 * margin,
    innerW = width - 2 * margin;

/**
 * Initializes the plot
 */
exports.init = function(data, a, updateFunc) {
    var start_time = d3.min(data, a.time),
        end_time = d3.max(data, a.time);
    tScale = d3.time.scale().domain([start_time, end_time])
        .range([0, innerW]);
    svg = d3.select('#time-plot');
    svg.attr({ width : width,
               height : height });
    inner = d3.select('#time-plot').append('g')
        .attr('transform', 'translate(' + margin + ', ' + margin + ')');
    // Sets up axes
    var tAxis = d3.svg.axis().scale(tScale).orient('bottom').ticks(12);
    inner.append('g')
        .attr('class', 'axis time-axis')
        .attr('transform', 'translate(0, ' + innerH + ')')
        .call(tAxis);
    // Set up the boundary lines
    endpoints = svg.append('g').attr('id', 'time-endpoints')
        .attr('transform', 'translate(' + margin + ', ' + margin + ')');
    var parent = document.getElementById('time-plot');
    endpoints.append('line')
        .attr({
            class : 'endpoint left',
            x1 : tScale(start_time),
            x2 : tScale(start_time),
            y1 : 0,
            y2 : innerH
        })
        .on('mousedown', drag.dragLR(0, innerW, parent, updateDateRange, margin));
    endpoints.append('line')
        .attr({
            class : 'endpoint right',
            x1 : tScale(end_time),
            x2 : tScale(end_time),
            y1 : 0,
            y2 : innerH
        })
    .on('mousedown', drag.dragLR(0, innerW, parent, updateDateRange, margin));
    // Plots the data
    exports.plot(data, a);

    function updateDateRange() {
        var left = svg.select('.endpoint.left').attr('x1');
        var right = svg.select('.endpoint.right').attr('x1');
        left = tScale.invert(left);
        right = tScale.invert(right);
        inner.selectAll('rect').classed('selected', false);
        inner.selectAll('rect').filter(inside).classed('selected', true);
        function inside(d) {

            return +d.hour <= +right && +d.hour >= +left;
        }
        // Now update the geo plot:
        updateFunc({startTime : left,
                    endTime : right});
    }
};

/**
 * Plots the actual bars and such. does the updates also.
 */
exports.plot = function(data, a) {
    // Gotta hand-roll these counts!
    var start_time = d3.time.hour.floor(d3.min(data, a.time));
    var hours = d3.time.hour.range(start_time, d3.max(data, a.time));
    var counts = hours.map(function(d) { return { hour : d, count : 0 }; });
    data.forEach(countTime);
    function countTime (d) {
        var this_hour = d3.time.hour.floor(a.time(d));
        var i;
        for (var j = 0; j < hours.length; j++)
            if (+hours[j] === +this_hour) {
                i = j;
                break;
            }
        if (i === undefined)
            throw new Error('WTF!');
        counts[i].count++;
    }
    function count (d) { return d.count; }
    // Add scale for counts
    nScale = d3.scale.linear().domain([0, d3.max(counts, count)])
        .range([0, innerH]);
    // Draw rectangles
    inner.selectAll('rect').remove();

    // tooltips
    var tooltip = d3.tip().attr('class', 'd3-tip')
            .html(function (d) { return d.count; });
    inner.call(tooltip);

    var rects = inner.selectAll('rect').data(counts);

    rects.enter()
        .append('rect')
        .attr({ width : (innerW / counts.length) - 1,
                height : function (d) { return nScale(count(d)); },
                x : function (d) { return tScale(d.hour); },
                y : function (d) { return innerH - nScale(count(d)); },
                class : 'selected'
              })
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);
};


