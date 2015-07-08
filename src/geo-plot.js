// Plot config
var svg, xScale, yScale, typeScale;
var width = 1000,
    height = 800,
    margin = 50;

/**
 * Initializes the plot and then plots the first version
 */
exports.init = function (data, a) {
    svg = d3.select('#geo-plot');
    svg.attr({ width : width,
               height : height });
    xScale = d3.scale.linear().domain(d3.extent(data, a.x))
        .range([margin, width - margin]);
    yScale = d3.scale.linear().domain(d3.extent(data, a.y))
        .range([height - margin, margin]);
    typeScale = d3.scale.category20();
    exports.plot(data, a);
};

/**
 * Updates the geographic plot
 */
exports.plot = function (data, a) {
    var selection = svg.selectAll('circle').data(data);

    selection.enter()
        .append('circle')
        .attr({cx : function (d) { return xScale(a.x(d)); },
               cy : function (d) { return yScale(a.y(d)); },
               r : 2,
               fill : function (d) { return typeScale(a.type(d)); }
              });
    selection.exit().remove();
};
