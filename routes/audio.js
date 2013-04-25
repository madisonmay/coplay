var gs = require('../grooveshark'),
    echo = require('../echonest');

var Models = require('../models/models.js');
var User = Models.User;
var request = require('request')

exports.getPlaylistFromMix = function(req,res){
    var numSongs;
    var streamKeys = [];
    var echonestPlaylistCallback = function(playlist) {
        numSongs = playlist.length;
        for (var i = 0; i < playlist.length; i++) {
            var songInfo = playlist[i].title + " " + playlist[i].artist_name;
            var songQuery = {method: "getSongSearchResults",
                            parameters:{query:songInfo,limit:1,
                                        country:{ID:223,CC1:0,CC2:0,CC3:0,CC4:1073741824,DMA:506,IPR:0}},
                            header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}}
            var singleSongLookup = function(query) {
                setTimeout(function() {gs.make_request(query,groovesharkSongQueryCallback);
                                        },10*i)
            }
            singleSongLookup(songQuery)
            
        };
    }
    var groovesharkSongQueryCallback = function(queryResult) {
        console.log(JSON.stringify(queryResult));
        if(queryResult.result.songs.length > 0) {
            var songID = queryResult.result.songs[0].SongID;
            var streamQuery= {method: "getStreamKeyStreamServer",
                    parameters:{songID:songID,
                                country:{ID:223,CC1:0,CC2:0,CC3:0,CC4:1073741824,DMA:506,IPR:0}},
                    header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}};

            gs.make_request(streamQuery, function (result) {
                result.result.songName = queryResult.result.songs[0].SongName;
                result.result.artistName = queryResult.result.songs[0].ArtistName;
                groovesharkStreamQueryCallback(result);
            });
        } else {
            numSongs -= 1;
        }
    }

    var groovesharkStreamQueryCallback = function(queryResult) {
        numSongs -= 1;
        streamKeys.push(queryResult.result);
        if(numSongs<=0){
            console.log(streamKeys);
            res.send(streamKeys);
        }
    }
    //echo.getPlaylistFromMix(req.session.mix,echonestCallback);
    //echo.getPlaylistFromMix("5132d5b6e85596b332000005",echonestPlaylistCallback);
    var userFindCallback = function(err,doc){
        console.log("Result:")
        console.log(doc)
        echo.getPlaylistFromMix(doc.mix,echonestPlaylistCallback);
    };
    console.log(req.session.user)
    User.findOne({fb_id:req.session.user},userFindCallback)
};

exports.autocomplete = function(req, res) {
    //Spotify api calls for song/artist autocomplete functionality
    var querystring = req.query.q;
    request('http://ws.spotify.com/search/1/track.json?q=' + encodeURIComponent(querystring), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body).tracks;
        console.log(data[1])
        var result = [];

        count = 0
        i = 0
        while (count<10 && i<data.length) {
            if (data[i].album.name.toLowerCase().indexOf(querystring.toLowerCase()) === -1) {
                result.push({name:data[i].name, artist:data[i].artists[0].name})
                count++;
            }
            i++;
        }
        res.json(result);
        console.log(result);
      }
    })
}
