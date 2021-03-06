
var dataset = {
    counts: ['2', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '11', '12', '13', '14', '15', '16', '16', '17', '18'],
    names: ['The Beach Boys', 'The Eagles', 'The Beatles', 'The Who', 'Black Sabbath', 'Foo Fighters', 'The Kennedys', 'T.I.',
            'Three Days Grace', 'AWOLNATION', 'The Monkeys']
};

var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scale.category20b();

var pie = d3.layout.pie()
    .sort(null);

var arc = d3.svg.arc()
    .innerRadius(radius - 110)
    .outerRadius(radius - 20);

var svg = d3.select(".chart_body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var path = svg.selectAll("path")
    .data(pie(dataset.counts))
  .enter().append("path")
    .attr("fill", function(d, i) { return color(i); })
    .attr("base_color", function(d, i) { return color(i); })
    .attr("d", arc)
    .attr("count", function(d, i) { return dataset.counts[i]; })
    .on("mouseover", function(){
        d3.select(this).style("fill", "#DDDDDD");
    })
    .on("mouseout", function(){
        d3.select(this).style("fill", function() { return d3.select(this).attr("base_color"); });
    });
