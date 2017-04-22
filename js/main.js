$(function(){

        var color = 'SPECIES';
        var dateMin = 1990;
        var dateMax = 2017;
        var time;

        var margin = {
            left: 70,
            bottom: 100,
            top: 50,
            right: 50
        };

        var height = 600;
        var width = 1000;

        var drawHeight = height - margin.bottom - margin.top;
        var drawWidth = width - margin.left - margin.right;

        var svg = d3.select('#vis')
            .append('svg')
            .attr('height', height)
            .attr('width', width);

        var g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('height', drawHeight)
            .attr('width', drawWidth);

    d3.csv('data/birdFlightDataPrepped.csv', function(error, allData){

        var nestedData = d3.nest()
            .key(function(d) {
                return d.ID;
            })
            .entries(allData);

        var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (drawHeight + margin.top) + ')')
            .attr('class', 'axis');

        var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

        var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left + drawWidth / 2) + ',' + (drawHeight + margin.top + 40) + ')')
            .attr('class', 'title');

        var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + drawHeight / 2) + ') rotate(-90)')
            .attr('class', 'title');
        
        var xAxis = d3.axisBottom();

        var yAxis = d3.axisLeft()
            .tickFormat(d3.format('.2s'));

        var xScale = d3.scaleLinear();

        var yScale = d3.scaleLinear();

        var myScale = function(data) {

            var xMin = d3.min(data, function(d) {
                return +d.SPEED;
            });

            var xMax = d3.max(data, function(d) {
                return +d.SPEED;
            });

            xScale.range([0, drawWidth])
                .domain([xMin, xMax]);
            
            var yMin = d3.min(data, function(d) {
                return +d.HEIGHT;
            });

            var yMax = d3.max(data, function(d) {
                return +d.HEIGHT;
            });

            yScale.range([drawHeight, 0])
                .domain([0, yMax]);
        };

        var myAxis = function(){
            xAxis.scale(xScale);

            yAxis.scale(yScale);

            xAxisLabel.call(xAxis);
            xAxisLabel.selectAll("text")
            .attr("y", 0)
            .attr("x", -5)
            .attr("transform", "rotate(-45)")
            .attr('class', 'title')
            .style("text-anchor", "end");

            yAxisLabel.call(yAxis);

            xAxisText.text("Plane Speed")
                    .attr('transform', 'translate(' + (margin.left + drawWidth)/2 + ',' + (drawHeight + margin.top + 50) + ')')

            yAxisText.text('Plane Height');
        };

        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
            return "Elevation: " + d.HEIGHT + ", Speed: " + d.SPEED + ", " + color + ": " + d[color];
        });
        g.call(tip);

        var species = nestedData.map(function(d) {
            return d.values[0][color];
        });

        var colorScale = d3.scaleOrdinal().domain(species).range(d3.schemeCategory10);

        var draw = function(data) {
            myScale(data);
            myAxis();
        var circles = g.selectAll('circle').data(data);
            circles.enter().append('circle')
            .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .merge(circles)
                .transition()
                .duration(500)
                .attr('r', 5)
                .attr("fill", function(d) {
                    return colorScale(d[color]);
                })
                .attr('stroke', 'black')
                .attr('cy', height)
                .style('opacity', 0.3)
                .attr('cx', function(d) {
                    return xScale(d.SPEED);
                })
                .attr('cy', function(d) {
                    return yScale(d.HEIGHT);
                });
            circles.exit().remove();
        };


        var filterAll = function(){
            var data = allData.filter(function(d) {
                    return d.SPEED > 0 && d.HEIGHT > 0 && d.INCIDENT_YEAR >= dateMin && d.INCIDENT_YEAR <= dateMax && d.TIME_OF_DAY == time;
                });
            return data;
        };

        var filter = function(){
            var data = allData.filter(function(d) {
                    return d.SPEED > 0 && d.HEIGHT > 0 && d.INCIDENT_YEAR >= dateMin && d.INCIDENT_YEAR <= dateMax;
                });
            return data;
        };

        $("input").on('change', function(){
            val = $(this).val();
            var isTime = $(this).hasClass('TIME_OF_DAY');
            if (isTime) time = val; 
            else color = val;
            if (isTime == true && time == 'All') {
                    var data = filter();
                    draw(data);
            } else if (isTime == true && time != 'All') {
                var data = filterAll();
                draw(data);
            } else {
                var data = filter();
                draw(data);
            }
        });

        $("#minDate").on('change', function(){
            dateMin = $(this).val();
            var data = filter();
            draw(data);
        });

        $("#maxDate").on('change', function(){
            dateMax = $(this).val();
            var data = filter();
            draw(data);
        });

        var data = filter();
        draw(data);

    });
});

