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
function maingraph(input_counts, names) {

    var counts = flatten(input_counts);
    var artist_names = flatten(names);
    var map = {};
    var combined_counts = [];
    var combined_names = [];

    //Combine counts and names into dictionary
    for (i in counts) {

        //Leave out negative values
        if (counts[i] > 0) {
            if (artist_names[i] in map) {
                map[artist_names[i]] += parseInt(counts[i]);
            } else {
                map[artist_names[i]] = parseInt(counts[i]);
            }
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
            $(".description").html(currentText);
        });

}

window.currentText = $(".description").text();
counts = user_list.user_counts;
names = user_list.artist_names;
console.log("Counts: ", counts);
console.log("Names: ", names);
maingraph(counts, names);

$(document).ready(function() {

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $.post('/getLocation', {'latitude': position.coords.latitude, 'longitude': position.coords.longitude});
      });
    }

    function vote_response(data) {
      data = JSON.parse(data);
      counts = data.user_counts;
      names = data.artist_names;
      console.log("Counts: ", counts);
      console.log("Names: ", names);
      $('.chart_body').html("");
      maingraph(counts, names);
    }

    var upvote = function() {
      console.log("Upvote");
      name = $('#songName').attr('name');
      artist = $('#songName').attr('artist');
      base_url = window.location.pathname;
      $('.downvote').attr('src', '/images/down.png');
      $('.upvote').attr('src', '/images/up_green.png');
      $.post(base_url + '/edit', {'name': name, 'artist': artist, 'up': 1}, vote_response);
    };

    var downvote = function() {
      console.log("Downvote");
      name = $('#songName').attr('name');
      artist = $('#songName').attr('artist');
      base_url = window.location.pathname;
      $('.downvote').attr('src', '/images/down_red.png');
      $('.upvote').attr('src', '/images/up.png');
      $.post(base_url + '/edit', {'name': name, 'artist': artist, 'up': 0}, vote_response);
    }

    $(document).on('click','.musiclink',function () {
      $('.close').trigger('click');
      var artist = $(this).attr("artist");
      if ($(this).attr("type") == "track") {
        var track = $(this).attr("track")
        $.post(window.location.pathname + '/addTrack', {'track': track, 'artist': artist}, vote_response);
      }
      else if ($(this).attr("type") == "artist") {
        $.post(window.location.pathname + '/addArtist', {'artist': artist}, vote_response);
      }
    });

    $('.upvote').on('click', upvote);
    $('.downvote').on('click', downvote);

});