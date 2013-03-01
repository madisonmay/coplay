var flatten = function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    // See if this index is an array that itself needs to be flattened.
    if (toFlatten.some(Array.isArray)) {
      return flat.concat(flatten(toFlatten));
    // Otherwise just add the current index to the end of the flattened array.
    } else {
      return flat.concat(toFlatten);
    }
  }, []);
};

function maingraph(input_counts) {

    var counts = flatten(input_counts);

    console.log(counts);

    var dataset = {
        counts: counts,
    };

    var width = 800,
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
}

function usergraph(num) {

    var user_counts = [];

    for (i=0; i<num; i++) {

        console.log(i)
        var count = [];

        for (j = 0; j<10; j++){
            var random=Math.floor(Math.random()*11)
            count.push(random.toString());
        }

        user_counts.push(count)
        console.log("Count:" + count)
    }

    console.log(user_counts)

    var dataset = {
        user_counts: user_counts,
        names: ['The Beach Boys', 'The Eagles', 'The Beatles', 'The Who', 'Black Sabbath', 'Foo Fighters', 'The Kennedys', 'T.I.',
                'Three Days Grace', 'AWOLNATION', 'The Monkeys']
    };

    var width = 500;
        height = 200,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.category20b();

    var pie = d3.layout.pie()
        .sort(null);

    var arc = d3.svg.arc()
        .innerRadius(radius - 60)
        .outerRadius(radius - 10);

    for (i=0; i < num; i++) {

        var svg = d3.select(".user_chart_body").append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var path = svg.selectAll("path")
            .data(pie(dataset.user_counts[i]))
          .enter().append("path")
            .attr("fill", function(d, i) { return color(i); })
            .attr("base_color", function(d, i) { return color(i); })
            .attr("d", arc)
            .attr("count", function(d, i) { return dataset.user_counts[i]; })
            .on("mouseover", function(){
                d3.select(this).style("fill", "#DDDDDD");
            })
            .on("mouseout", function(){
                d3.select(this).style("fill", function() { return d3.select(this).attr("base_color"); });
            });
    }

    return user_counts;
};

var counts = usergraph(3, ['Madison', 'Derek', 'Tom']);
maingraph(counts);

