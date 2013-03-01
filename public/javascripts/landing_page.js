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

var artists = ['Pink Floyd', 'The Beatles', 'Led Zeppelin', 'The Rolling Stones',
               'Michael Jackson', 'The Who', 'Queen', 'U2', 'The Beach Boys',
               'Elvis Presley', 'Grateful Dead', 'The Doors', 'The Jimi Hendrix Experience',
               'Bob Dylan', 'Eagles', 'Crosby, Stills, Nash and Young', 'Metallica',
               'Bob Marley and the Wailers', 'Steely Dan', 'Rush', 'Pixies', 'Moody Blues',
               'Jefferson Airplane', 'Fleetwood Mac', 'Aerosmith', 'Foreigner',
               'Stone Temple Pilots', 'The Bee Gees', 'The Allman Brothers', 'The Cure',
               'Eric Clapton', 'Santana', 'Van Halen'];


//Main graph and user graph functions should eventually be merged.
function maingraph(input_counts) {

    var counts = flatten(input_counts);
    var artist_names = [];

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

function usergraph(num, users) {

    var user_counts = [];
    var artist_names = [];

    for (i=0; i<num; i++) {

        var count = [];

        for (j = 0; j<10; j++){
            var random=Math.floor(Math.random()*11);
            count.push(random.toString());
            var randomArtist = Math.floor(Math.random()*artists.length);
            artist_names.push(artists[randomArtist]);
        }

        user_counts.push(count);
    }

    var dataset = {
        user_counts: user_counts,
        artist_names: artist_names,
        usernames: users
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
            .attr("height", height-5)
          .append("g")
            .attr("transform", "translate(" + width / 4  + "," + height / 2 + ")");

        var path = svg.selectAll("path")
            .data(pie(dataset.user_counts[i]))
          .enter().append("path")
            .attr("fill", function(d, i) { return color(i); })
            .attr("base_color", function(d, i) { return color(i); })
            .attr("d", arc)
            .attr("username", dataset.usernames[i])
            .attr("artist_name", dataset.artist_names[i])
            .attr("count", function(d, i) { return dataset.user_counts[i]; })
            .on("mouseover", function(){
                d3.select(this).style("fill", "#DDDDDD");
            })
            .on("mouseout", function(){
                d3.select(this).style("fill", function() { return d3.select(this).attr("base_color"); });
            });


        var text = svg.append('text').text(dataset.usernames[i]);
        text.attr("y", "10").attr("x", "110").attr('width', "100px")
    }

    return [user_counts, artist_names];
};

var values = usergraph(3, ['Tom', 'Derek', 'Madison']);
counts = values[0];
artists = values[1];
maingraph(counts);

