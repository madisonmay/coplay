var echojs = require('echojs');
var echo = echojs({
  key: process.env.ECHONEST_KEY
});

var http = require('http');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Mix = mongoose.model('Mix');

exports.getPlaylistFromMix = function(mixid,sendPlaylistToClient) {
    var intervalID;
    var tasteProfileID;
    var tasteProfileTicket;
    var preferences;
    var makeTasteProfile = function() {
        console.log("pref")
        console.log(preferences)
        console.log(JSON.stringify({
            api_key: process.env.ECHONEST_KEY,
            type: "general",
            name: Math.random().toString(36).substr(2,10)
        }));
        echo('catalog/create').post({
            type: 'general',
            name: Math.random().toString(36).substr(2,10)
        }, tasteProfileCreateCallback);
    };
    var tasteProfileCreateCallback = function (err, json) {
        var items=[];
        console.log(json);
        tasteProfileID = json.response.id;
        for (var i = 0; i < preferences.artists.length; i++) {
            items.push({item: {
                                item_id: "artists"+i,
                                artist_name: preferences.artists[i].name,
                                rating: Math.ceil(preferences.artists[i].weight/10) //might need to scale
                                }
                        });
        };
        for (var i = 0; i < preferences.songs.length; i++) {
            items.push({item: {
                                item_id: "songs"+i,
                                song_name: preferences.songs[i].name,
                                artist_name: preferences.songs[i].artist,
                                rating: Math.ceil(preferences.songs[i].weight/10) //might need to scale
                                }
                        });
        };

        console.log(items);


        echo('catalog/update').post({
            id: tasteProfileID,
            data:JSON.stringify(items),
        }, tasteProfileUpdateCallback);
    };
    var tasteProfileUpdateCallback = function (err, json) {
        console.log(json);
        tasteProfileTicket = json.response.ticket;
        intervalID = setInterval(checkTasteProfileStatus,150);
    };
    var checkTasteProfileStatus = function () {
        echo('catalog/status').get({
            ticket: tasteProfileTicket
        }, checkStatusCallback);
    };
    var checkStatusCallback = function (err,json) {
        console.log(json);
        if(json.response.ticket_status==="complete") {
            clearInterval(intervalID);
            getPlaylistFromTasteProfile();
        } else if(json.response.ticket_status==="error") {
            clearInterval(intervalID);
            return null;
        }
    };
    var getPlaylistFromTasteProfile = function () {
        echo('playlist/static').get({
            seed_catalog: tasteProfileID,
            type: "catalog-radio",
            adventurousness: 0,
            results: 6
        }, function (err,json) {
            if (err) return console.log(err);
            console.log("------------------");
            console.log("Playlist:");
            console.log(json.response.songs);
            sendPlaylistToClient(json.response.songs);
            echo('catalog/delete').post({
                id: tasteProfileID
            });
        });
    };
    console.log('breakpoint1')
    var findMixCallback = function (err,doc){
            console.log('breakpoint2')
            console.log("Callback")
            console.log(doc)
            var songs = [];
            var artists = [];
            for (var i = 0; i < doc.users.length; i++) {
                var totalWeight = 0;
                var artisttemp = [];
                var songtemp = [];
                console.log(doc.users[i].preferences)
                for (var j = 0; j < doc.users[i].preferences.songs.length; j++) {
                    songtemp.push(doc.users[i].preferences.songs[j])
                    totalWeight += doc.users[i].preferences.songs[j].weight;
                };
                for (var j = 0; j < doc.users[i].preferences.artists.length; j++) {
                    artisttemp.push(doc.users[i].preferences.artists[j])
                    totalWeight += doc.users[i].preferences.artists[j].weight;
                };

                console.log(totalWeight)
                //normalize the weight
                for (var j = 0; j < songtemp.length; j++) {
                    songtemp[j].weight *= 100.0/totalWeight;
                };
                for (var j = 0; j < artisttemp.length; j++) {
                    artisttemp[j].weight *= 100.0/totalWeight;
                };
                console.log(songtemp)
                songs=songs.concat(songtemp)
                artists=artists.concat(artisttemp)
            };
        console.log(songs)
        //preferences = doc.preferences;
        preferences = {artists:artists,songs:songs};
        makeTasteProfile();
    };
    Mix.findOne({_id:mixid}).populate('users').exec(findMixCallback);
};