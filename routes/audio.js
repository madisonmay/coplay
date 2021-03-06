var gs = require('../grooveshark'),
    echo = require('../echonest');

var Models = require('../models/models.js');
var User = Models.User;
var Station = Models.Station;
var request = require('request')

var getPlaylistFromMix = function(station,callback){
    var echonestPlaylistCallback = function(playlist) {
        callback(playlist)
    }

    var stationFindCallback = function(err,doc){
        // console.log("Result:")
        // console.log(doc)
        echo.getPlaylistFromMix({artists: doc.artists, songs: doc.songs},echonestPlaylistCallback);
    };
    Station.findOne({_id:station},stationFindCallback);
};

exports.generateNewPlaylist = getPlaylistFromMix;


exports.getNextSong = function(req,res,io) {
    var getNextSongCallback = function(playlist) {
        // console.log(playlist)
        // console.log(req.session.playlist)

        song = playlist.pop()
        req.session.playlist = playlist

        var songInfo = song.title + " " + song.artist_name;
        var songQuery = {method: "getSongSearchResults",
                        parameters:{query:songInfo,limit:1,
                                    country:{ID:223,CC1:0,CC2:0,CC3:0,CC4:1073741824,DMA:506,IPR:0}},
                        header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}}

        var groovesharkSongQueryCallback = function(queryResult) {
            // console.log("Song: ", JSON.stringify(queryResult));
            if(queryResult.result.songs.length > 0) {
                var songID = queryResult.result.songs[0].SongID;
                var albumArt = queryResult.result.songs[0].CoverArtFilename;
                var streamQuery= {method: "getStreamKeyStreamServer",
                        parameters:{songID:songID,
                                    country:{ID:223,CC1:0,CC2:0,CC3:0,CC4:1073741824,DMA:506,IPR:0}},
                        header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}};

                gs.make_request(streamQuery, function (result) {
                    result.result.songName = queryResult.result.songs[0].SongName;
                    result.result.songID = queryResult.result.songs[0].SongID;
                    result.result.artistName = queryResult.result.songs[0].ArtistName;
                    result.result.albumArt = queryResult.result.songs[0].CoverArtFilename;

                    groovesharkStreamQueryCallback(result);

                    var setNewSongInDataBase = function(err,doc) {
                        var artwork = queryResult.result.songs[0].CoverArtFilename;
                        if (artwork) {
                            artwork = 'http://beta.grooveshark.com/static/amazonart/l' + artwork;
                        } else {
                            artwork = 'http://beta.grooveshark.com/static/albums/500_album.png';
                        }
                        doc.current = {song: queryResult.result.songs[0].SongName, 
                            artist: queryResult.result.songs[0].ArtistName, 
                            artwork:artwork};
                        doc.save();
                    }

                    Station.findOne({_id:req.session.station},setNewSongInDataBase);

                    io.sockets.in(req.session.station).emit('update',{
                                        title:queryResult.result.songs[0].SongName,
                                        artist:queryResult.result.songs[0].ArtistName,
                                        artwork:queryResult.result.songs[0].CoverArtFilename});
                });
            } else {
                if (playlist.length <= 0) {
                    playlist = getPlaylistFromMix(req.session.station,getNextSongCallback);
                } else {
                    getNextSongCallback(playlist);
                }
            }
        }

        var groovesharkStreamQueryCallback = function(queryResult) {
            res.send(queryResult.result);
        }

        gs.make_request(songQuery, groovesharkSongQueryCallback);
    }

    if (!req.session.playlist || req.session.playlist.length <= 0) {
        playlist = getPlaylistFromMix(req.session.station,getNextSongCallback);
    } else {
        getNextSongCallback(req.session.playlist);
    }
}

var emptyCallback = function (data) { }

exports.markPlayed30sec = function(req,res) {
    console.log('30sec');
    gs.make_request({method: "markStreamKeyOver30Secs",
                        parameters:{streamKey:req.body.streamkey,
                                    streamServerID:req.body.serverID},
                        header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}},emptyCallback)
    res.send('');
}

exports.markSongComplete = function(req,res) {
    console.log('complete');
    gs.make_request({method: "markSongComplete",
                        parameters:{streamKey:req.body.streamkey,
                                    streamServerID:req.body.serverID,
                                    songID:req.body.songID},
                        header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}},emptyCallback)
    res.send('');
}

exports.autocomplete = function(req, res) {
    //Spotify api calls for song/artist autocomplete functionality
    var querystring = req.body.query;
    var type = "track"
    request('http://ws.spotify.com/search/1/track.json?q=' + encodeURIComponent(querystring), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body).tracks;
        var results = [];

        count = 0
        i = 0
        while (count<10 && i<data.length) {
            if (data[i].artists[0].name.toLowerCase().indexOf(querystring.toLowerCase()) != -1) {

                var unique = true;
                var artist = data[i].artists[0].name

                for (var j in results) {
                    if (results[j]['artist'] == artist) {
                        unique = false;
                    }
                }

                if (unique) {
                    results.push({artist: artist,type:"artist"})
                    count++;
                }

            } else if (data[i].album.name.toLowerCase().indexOf(querystring.toLowerCase()) === -1) {

                var unique = true;
                var artist = data[i].artists[0].name
                var name = data[i].name

                for (var j in results) {
                    if (results[j]['artist'] == artist && results[j]['name'] == name) {
                        unique = false;
                    }
                }

                if (unique && data[i].name.toLowerCase().indexOf(querystring.toLowerCase()) != -1) {
                    results.push({name:data[i].name, artist:data[i].artists[0].name,type:"track"})
                    count++;
                }
            }
            i++;
        }
        res.send(results);
      }
    })
}
