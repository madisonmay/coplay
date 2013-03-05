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

$('document').ready( function() {
    $('.friend').click( function () {
        var friend = $(this).attr("username");
        $.post('/addFriend', {'friend': friend});
    });
});

var artists = ['Pink Floyd', 'The Beatles', 'Led Zeppelin', 'The Rolling Stones',
               'Michael Jackson', 'The Who', 'Queen', 'U2', 'The Beach Boys',
               'Elvis Presley', 'Grateful Dead', 'The Doors', 'The Jimi Hendrix Experience',
               'Bob Dylan', 'Eagles', 'Crosby, Stills, Nash and Young', 'Metallica',
               'Bob Marley and the Wailers', 'Steely Dan', 'Rush', 'Pixies', 'Moody Blues',
               'Jefferson Airplane', 'Fleetwood Mac', 'Aerosmith', 'Foreigner',
               'Stone Temple Pilots', 'The Bee Gees', 'The Allman Brothers', 'The Cure',
               'Eric Clapton', 'Santana', 'Van Halen'];


//Main graph and user graph functions should eventually be merged.
function maingraph(input_counts, names) {

    var counts = flatten(input_counts);
    var artist_names = flatten(names);
    var map = {};
    var combined_counts = [];
    var combined_names = [];

    //Combine counts and names into dictionary
    for (i in counts) {
        if (artist_names[i] in map) {
            map[artist_names[i]] += parseInt(counts[i]);
        } else {
            map[artist_names[i]] = parseInt(counts[i]);
        }
    }

    console.log(map)

    //Move from object to two lists
    for (key in map) {
        combined_counts.push(map[key]);
        combined_names.push(key);
    }

    var dataset = {
        counts: combined_counts,
        artist_names: combined_names
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
        .attr("name", function (d, i) { return dataset.artist_names[i] })
        .attr("count", function(d, i) { return dataset.counts[i]; })
        .on("mouseover", function(){
            d3.select(this).style("fill", "#DDDDDD");
            var name = $(this).attr("name");
            $(".description").html(name);
        })
        .on("mouseout", function(){
            d3.select(this).style("fill", function() { return d3.select(this).attr("base_color"); });
            $(".description").html("Social Listening");
        });

}

function usergraph(users) {

    var num = users.length
    var user_counts = [];
    var artist_names = [];

    for (var i=0; i<num; i++) {

        var user_artists = [];
        var count = [];

        for (var j = 0; j<10; j++){
            var random=Math.floor(Math.random()*10+1);
            count.push(random.toString());
            var randomArtist = Math.floor(Math.random()*artists.length);
            user_artists.push(artists[randomArtist]);
        }

        artist_names.push(user_artists)
        user_counts.push(count);
    }

    var dataset = {
        user_counts: user_counts,
        artist_names: artist_names,
        usernames: users
    };

    console.log(user_counts);
    console.log(artist_names);

    var width = 360;
        height = 200,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.category20b();

    var pie = d3.layout.pie()
        .sort(null);

    var arc = d3.svg.arc()
        .innerRadius(radius - 60)
        .outerRadius(radius - 10);

    for (var n=0; n < num; n++) {

        var svg = d3.select(".user_chart_body").append("svg")
            .attr("width", 360)
            .attr("height", height-5)
          .append("g")
            .attr("transform", "translate(" + width / 4  + "," + height / 2 + ")");

        var path = svg.selectAll("path")
            .data(pie(dataset.user_counts[n]))
          .enter().append("path")
            .attr("fill", function(d, i) { return color(i); })
            .attr("base_color", function(d, i) { return color(i); })
            .attr("d", arc)
            .attr("username", dataset.usernames[n]['name'])
            .attr("name", function(d, i) { return dataset.artist_names[n][i];} )
            .attr("count", function(d, i) { return dataset.user_counts[n][i]; })
            .on("mouseover", function(){
                d3.select(this).style("fill", "#DDDDDD");
                var name = $(this).attr("name");
                $(".description").html(name);
            })
            .on("mouseout", function(){
                d3.select(this).style("fill", function() { return d3.select(this).attr("base_color"); });
                $(".description").html("Social Listening");
            });

        var text = svg.append('text').text(dataset.usernames[n]['name']);
        text.attr("y", "10").attr("x", "110");

        svg.append("image")
            .attr("xlink:href", "/images/delete.png")
            .attr("width", 25)
            .attr("height", 25)
            .attr("username", dataset.usernames[n]['name'])
            .attr("userid", dataset.usernames[n]['id'])
            .attr("y", "-11").attr("x", "-11")
            .on("click", function(){
                $(".description").html("Friend removed");
                $(this).parent().parent().remove();
                var friend = $(this).attr("userid");
                console.log(friend)
                $.post("/removeFriend", {'friend': friend}, function(err, data){
                    if (err) {
                        console.log(err)
                    } else {

                    }
                });
                setTimeout(function() {
                  location.reload(true);
                }, 500);
            });
    }

    return [user_counts, artist_names];
};

var values = usergraph(friend_list);
counts = values[0];
artists = values[1];
maingraph(counts, artists);

