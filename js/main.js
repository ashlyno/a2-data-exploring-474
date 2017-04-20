$(function(){

        var type = 'Price';
        var places = [];

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

    d3.csv('data/newprep.csv', function(error, allData){

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

        var xScale = d3.scaleBand();

        var yScale = d3.scaleLinear();

        var myScale = function(data) {
            var neighborhoods = data.map(function(d){
                return d.Neighbourhood_Group;
            });

            xScale.range([0, drawWidth])
                  .padding(0.1)
                  .domain(neighborhoods);
            
            var yMin = d3.min(data, function(d) {
                return +d.Value;
            });

            var yMax = d3.max(data, function(d) {
                return +d.Value;
            });

            // Set the domain/range of your yScale
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

            xAxisText.text('Neighbourhood')
                    .attr('transform', 'translate(' + (margin.left + drawWidth)/2 + ',' + (drawHeight + margin.top + 50) + ')')

            yAxisText.text(type);
        };

        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
            return d.Neighbourhood_Group + ', ' + d.Type + ': ' + d.Value;
        });
        g.call(tip);

        var draw = function(data) {
            myScale(data);
            myAxis();
        var bars = g.selectAll('rect').data(data);
            bars.enter().append('rect')
                .attr('x', function(d) {
                    return xScale(d.Neighbourhood_Group);
                })
                .attr('y', function(d) {
                    return drawHeight;
                })
                .attr('height', 0)
                .attr('class', 'bar')
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .attr('width', xScale.bandwidth())
                .merge(bars)
                .attr('y', function(d) {
                    return yScale(d.Value);
                })
                .attr('height', function(d) {
                    return drawHeight - yScale(d.Value);
                });
            bars.exit().remove();
        };


        var filter = function(){
            var data = allData.filter(function(d) {
                    return d.Type == type;
                });
            return data;
        };

        $("select").on('change', function(){
            type = $(this).val();
            var data = filter();
            draw(data);
        });

        d3.selectAll(".place").on("change",update);

        var checked = d3.selectAll(".place").property("checked")
        console.log(checked)
        //.on("change", update );

        function update() {
            if (d3.selectAll(".place").property('checked')) {
                console.log($(this).val());
                places.push($(this).val());
            }
            console.log(places);
        }

        var data = filter();
        draw(data);

    });

});

