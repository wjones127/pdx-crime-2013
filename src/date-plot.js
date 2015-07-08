// Functions to define the date Filter
var start = (function() {
    var startDate;
    return function (new_start) {
        if (new_start === undefined) return startDate;
        else startDate = new_start;
    };
})();
var end = (function() {
    var endDate;
    return function (new_end) {
        if (new_end === undefined) return endDate;
        else endDate = new_end;
    };
})();
function dateFilter (date) {
    return start() <= date <= end();
}
function dScale (d) {
    return dateFilter(date(d)) ? 'steelblue' : '#ccc';
}

// Plot config
var svg, inner, tScale, nScale;
var width = 1000,
    height = 250,
    margin = 50,
    innerH = height - 2 * margin,
    innerW = width - 2 * margin;

/**
 * Initializes the plot
 */
exports.init = function(data, a) {
    tScale = d3.time.scale().domain(d3.extent(data, a.date))
        .range([0, innerW]);
    svg = d3.select('#date-plot');
    svg.attr({ width : width,
               height : height });
    inner = d3.select('#date-plot').append('g')
        .attr('transform', 'translate(' + margin + ', ' + margin + ')');
    // Sets up axes
    var tAxis = d3.svg.axis().scale(tScale).orient('bottom').ticks(12);
    inner.append('g')
        .attr('class', 'axis date-axis')
        .attr('transform', 'translate(0, ' + innerH + ')')
        .call(tAxis);
    // Plots the data
    exports.plot(data, a);
};

/**
 * Plots the actual bars and such. does the updates also.
 */
exports.plot = function(data, a) {
    // Gotta hand-roll these counts!
    var start_month = d3.time.week.floor(d3.min(data, a.date));
    var months = d3.time.week.range(start_month, d3.max(data, a.date));
    var counts = months.map(function(d) { return { month : d, count : 0 }; });
    data.forEach(countDate);
    function countDate (d) {
        var this_month = d3.time.week.floor(a.date(d));
        var i;
        for (var j = 0; j < months.length; j++)
            if (+months[j] === +this_month) {
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
    var rects = inner.selectAll('rect').data(counts);

    rects.enter()
        .append('rect')
        .attr({ width : (innerW / counts.length) - 1,
                height : function (d) { return nScale(count(d)); },
                x : function (d) { return tScale(d.month); },
                y : function (d) { return innerH - nScale(count(d)); },
                class : 'selected'
              });
    rects.exit().remove();
};
