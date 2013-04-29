var Models = require('../models/models.js');
var User = Models.User;
var Station = Models.Station
var Mix = Models.Mix
var audio = require('./audio');

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i].toString() === obj.toString()) {
            return true;
        }
    }
    return false;
}

exports.editSongWeight = function(req, res) {
    console.log('Edit weight');
    Station.findOne({_id: req.params.station_id}, function(err, db_station) {
        var up = req.body.up;
        console.log(req.body);
        var edited = false;
        if (db_station) {
            for (var i=0; i<db_station.songs.length; i++) {
                if (db_station.songs[i].artist == req.body.artist) {
                    if (db_station.songs[i].name == req.body.name) {
                        if (up) {db_station.songs[i].weight *= 1.15;}
                        else {db_station.songs[i].weight /= 1.15;}
                        edited = true;
                        break;
                    }
                }
            }
            if (!edited) {
                if (up == 'true') {
                    console.log('Upvote')
                    db_station.songs.push({'name': req.body.name, 'artist': req.body.artist, 'weight': .5})
                } else {
                    console.log('Downvote')
                    db_station.songs.push({'name': req.body.name, 'artist': req.body.artist, 'weight': -0.5})
                }
            }
            db_station.save()
        } else {
            console.log("Station not found: ", req.params.station_id)
        }
    });
}

//Still need to handle case where object with same values already exists
exports.addNewArtist = function(req, res) {
    console.log('Add new artist');
    var updatePlaylistCallback = function(playlist) {
        console.log(playlist);
        req.session.playlist = playlist;
        res.send('');
    }
    Station.findOne({_id: req.params.station_id}, function(err, db_station) {
        if (db_station) {
            db_station.artists.push({'name': req.body.artist, 'weight': 1})
            db_station.save()
            audio.generateNewPlaylist(req.session.station,updatePlaylistCallback);
        } else {
            console.log("Station not found: ", req.params.station_id)
        }
    });
}

exports.addNewTrack = function(req, res){
    console.log('Add new track');
    var updatePlaylistCallback = function(playlist) {
        console.log(playlist);
        req.session.playlist = playlist;
        res.send('');
    }
    Station.findOne({_id: req.params.station_id}, function(err, db_station) {
        if (db_station) {
            db_station.songs.push({'artist': req.body.artist, 'name':req.body.track ,'weight': 1})
            db_station.save()
            audio.generateNewPlaylist(req.session.station,updatePlaylistCallback);
        } else {
            console.log("Station not found: ", req.params.station_id)
        }
    });
}

exports.getLocation = function(req, res){
    if (req.session.user_id) {
        User.findOne({fb_id : req.session.user_id}).exec(function(err, db_user) {
            if (db_user) {
                db_user.location = [req.body.latitude, req.body.longitude];
                db_user.save();
            } else {
                console.log("User not found: ", req.session.user_id);
            }
        });
    }
}

exports.play = function(req, res) {
    res.render('play', { title: 'Now Playing'});
}

exports.station = function(req, res) {
    latitude = req.body.latitude;
    longitude = req.body.longitude;
    console.log('Adding station...')

    User.findOne({fb_id : req.session.user}).exec(function(err, db_user) {
        if (db_user) {
            var station_data = {name: req.body.name, location: [latitude, longitude], active: true, users: [db_user]};
            if (req.body.seed_type === 'artist') {
                station_data.artists = [{name:req.body.seed, weight:1.0}];
            } else {
                station_data.songs = [{name:req.body.seed, artist:'?',weight:1.0}];
            }
            var new_station = Station(station_data);
            new_station.save(function(err) {
                if(err) {
                    console.log("Error: ", err);
                    res.send('/locate');
                } else {
                    console.log("Station saved.");
                    res.send('/play');
                }
            });
        } else {
            console.log("User must be logged in to create a station.");
            res.send('/locate');
        }
    });
}

exports.locate = function(req, res){
    Station.find({}).populate('users').exec(function(err, db_stations) {
        if (err) {
            console.log(err)
        } else {
            User.findOne({fb_id: req.session.user}, function(err, db_user) {
                if (db_user) {

                    console.log("User location", db_user)

                    function square(x) {return x*x;}
                    function dist(x) {
                        return Math.sqrt(square(x.location[0] - db_user.location[0]) + square(x.location[1] - db_user.location[1]))}

                    db_stations.sort(function(a, b) {
                       return dist(a) - dist(b)
                    })

                    res.render('locate', {'title': 'Stations nearby...', 'stations': db_stations});
                } else {
                    res.redirect('/');
                }
            });
        }

    });
}

exports.newsearch = function(req, res){
    res.render('newsearch', {'title': 'Search Page'})
}


exports.station_view = function(req, res){

    //Main page for mixing and welcome page
    console.log('id',req.params.station_id)
    Station.findOne({ _id: req.params.station_id }).populate('users').exec(function(err, db_station) {
        if (err) {
            res.send('An error occurred')
        } else {
            req.session.station = req.params.station_id;
            User.findOne({fb_id: req.session.user}, function(err, db_user) {

                var users = [];
                var topics = [];
                var weights = [];

                if (! station.users.contains(db_user)) {
                    station.users.push(db_user);
                    station.save();
                }

                var populateStation = function (station) {
                    console.log("Station users: ", station.users)
                    for (var k=0; k < station.users.length; k++) {
                        console.log(station.users[k])
                        users.push({'name': station.users[k].username, 'id': station.users[k]._id,
                                    'fb_id': station.users[k].fb_id})
                    }
                    topics.push([]);
                    weights.push([]);
                    var i = topics.length-1;
                    var totalWeight = 0;
                    for (var j = 0; j < station.songs.length; j++) {
                        topics[i].push(station.songs[j].name)
                        weights[i].push(station.songs[j].weight)
                        totalWeight += weights[i][j];
                    };
                    for (var j = 0; j < station.artists.length; j++) {
                        topics[i].push(station.artists[j].name)
                        weights[i].push(station.artists[j].weight)
                        totalWeight += weights[i][j];
                    };

                    //normalize the weight
                    for (var j = 0; j < weights[i].length; j++) {
                        weights[i][j] *= 100.0/totalWeight;
                    };

                    console.log(req.session.user);
                    console.log('Users: -->', users)
                    res.render('station', {'title': 'Coplay', 'user': db_user, 'fb_id': req.session.user, 'logged_in': true, 'friends': JSON.stringify({users: users, artist_names:topics, user_counts:weights})});
                }

                populateStation(db_station);
            });


        }
    });
};

exports.landing_page = function(req, res){
    //Main page for mixing and welcome page
    User.findOne({fb_id : req.session.user}).populate('friend_list').populate('mix').exec(function(err, db_user) {

        if (db_user) {
            console.log(db_user.mix)
            console.log(db_user.friend_list);
            var users = [];
            var topics = [];
            var weights = [];

            var mixPopulateCallback = function (err,doc) {
                console.log("Callback")
                console.log(doc)
                users.push({name:doc.first_name,id:doc._id});
                topics.push([]);
                weights.push([]);
                var i = topics.length-1;
                var totalWeight = 0;
                for (var j = 0; j < doc.preferences.songs.length; j++) {
                    topics[i].push(doc.preferences.songs[j].name)
                    weights[i].push(doc.preferences.songs[j].weight)
                    totalWeight += weights[i][j];
                };
                for (var j = 0; j < doc.preferences.artists.length; j++) {
                    topics[i].push(doc.preferences.artists[j].name)
                    weights[i].push(doc.preferences.artists[j].weight)
                    totalWeight += weights[i][j];
                };

                if (!doc.preferences.artists.length) {
                    topics[i].push("Taylor Swift")
                    weights[i].push(1);
                    totalWeight += 1;
                }

                console.log(totalWeight)
                //normalize the weight
                for (var j = 0; j < weights[i].length; j++) {
                    weights[i][j] *= 100.0/totalWeight;
                };
                if((i+1)>=db_user.mix.users.length) {
                    console.log(weights)
                    var data = [{name: 'Derek', id: 1}, {name: 'Tom', id: 2}, {name:'Madison', id: 3}];
                    var data2 = db_user.friend_list;
                    data2 = data2.filter(function(el){
                        return (!db_user.mix.users.contains(el._id))
                    })
                    console.log('Users: ', JSON.stringify(users))
                    res.render('home', {'title': 'Coplay: Social Music At Its Finest', 'user': db_user, 'logged_in': true, 'friends': JSON.stringify({users:users, artist_names:topics,user_counts:weights}), 'other_friends': data2});

                }
            }
            console.log(db_user.mix)
            console.log(db_user.mix.users[0])
            for (var i = 0; i < db_user.mix.users.length; i++) {
                console.log(db_user.mix.users[i])
                console.log(db_user._id)
                User.findOne({_id:db_user.mix.users[i]}).exec(mixPopulateCallback);
            };


            }

        else {
            res.render('landing', {'title': 'Coplay: Social Music At Its Finest', 'logged_in': false});
        }
    });
};
exports.about = function(req, res){
    res.render("about", {title: 'Coplay', logged_in: false});
};

function get_friends(fb_id, thisID,req, res, callback){
    //Populates the user object with friends who use CoPlay
    var curr = 0;
    var max;

    //attempt to complete request
    function save_try(friends, friend_list, i) {
        curr += 1;
        if (curr == max){
            console.log(friend_list);
            console.log("Friend list: ", friend_list);
            console.log("Callback:", callback);
            //save to user friend_list
            callback(friend_list);
        }
    }

    function db_query(friends, friend_list, i) {
        //Query database for fb_ids
        var queryCallback = function(err, db_user){
            if (db_user) {
                console.log(friends.data[i].id)
                console.log("DB_USER", db_user);
                friend_list.push(db_user);
                console.log("Friend list:", friend_list);
                db_user.friend_list.push(thisID);
                db_user.save(console.log);
            }
            return save_try(friends, friend_list);
        };
        User.findOne({'fb_id': friends.data[i].id}, queryCallback);
    };

    //facebook request to generate list of fb_id
    req.facebook.api('/me/friends?', function(err, friends) {
        max = friends.data.length;
        var friend_list = [];
        for (var i=0; i<friends.data.length; i++){
            db_query(friends, friend_list, i);
        }

    });
}

exports.login = function(req, res, next){
    //Handles facebook authentication
    console.log("Logged in")
    req.facebook.api('/me', function(err, user) {
        User.findOne({fb_id : user.id}).exec(function(err, db_user) {

            //User in database
            if (db_user) {
                req.session.user = db_user.fb_id;
                req.session.uid = db_user._id
                get_friends(db_user.fb_id, db_user._id, req, res, function(friend_list){
                    db_user.friend_list = friend_list;
                    db_user.save();
                    next();
                });
            }

            //User DNE
            else if (!db_user || !db_user.length) {
                var new_user = new User({username: user.name, fb_id: user.id, first_name: user.first_name,
                                         last_name: user.last_name});
                new_user.save(function(err) {
                    if(err) {
                        console.log("Error: ", err);
                    }
                    var mix = new Mix({users: [new_user._id]});
                    mix.save(function(err) {
                        new_user.mix = mix;
                        req.session.user = new_user.fb_id;
                        req.session.uid = new_user._id
                        new_user.save(function (err) {
                            get_friends(new_user.fb_id, new_user._id, req, res, function(friend_list){
                                new_user.friend_list = friend_list;
                                new_user.save();
                                next();
                            });
                        });
                    });
                });
            }

            //Something else unexpected happens
            else {
                res.send("Coplay is currently experiencing issues.");
            }
        });
    });
};

exports.logout = function(req, res){

    req.session.destroy();
    res.redirect('/');
};

exports.refresh = function(req, res){
    //Finish logout process by destroying cookies and redirecting to the landing page
    req.session.destroy();
    res.redirect('/');
};

exports.settings = function(req, res){
    //Render the page for personal mix management
    user_id = req.session.user
    if (user_id) {
        logged_in = true
    } else {
        logged_in = false
    }

    User.findOne({'fb_id': user_id}, function(err, db_user) {
        if (err) {
            console.log(err);
        } else {
            artists = db_user.preferences.artists;
            res.render("settings", {title: 'Coplay: Adjust Mix', logged_in: logged_in, artists: artists});
        }
    });
};

exports.addFriend = function(req, res){
    console.log(req.body['friend'])
    console.log("Friend added");
}

exports.addArtist = function(req, res){
    //Grab user id from session variables
    //Add artist to user preferences
    user_id = req.session.user;
    console.log("Artist added");
    var artist_name = req.body['artist']
    console.log(artist_name);
    User.findOne({'fb_id': user_id}, function(err, db_user) {
        if (err) {
            console.log(err);
        } else {
            db_user.preferences.artists.push({"name": artist_name, "weight": 50})
            db_user.save()
        }
    });
}

exports.editArtist = function(req, res){
    //Edit user preferences
    user_id = req.session.user
    console.log("Artist values edited");
    artists = req.body['artists'];
    console.log(artists);
    User.findOne({'fb_id': user_id}, function(err, db_user) {
        if (err) {
            console.log(err);
        } else {
            db_user.preferences.artists = artists;
            db_user.save();
        }
    });
}

exports.removeArtist = function(req, res){
    //Remove an artist from user preferences
    user_id = req.session.user;
    console.log("Artist removed");
    var artist_name = req.body['artist'];
    console.log(artist_name);
    User.findOne({'fb_id': user_id}, function(err, db_user) {
        if (err) {
            console.log(err);
        } else {
            for (var i =0; i < db_user.preferences.artists.length; i++) {
                console.log(db_user.preferences.artists[i].name)
                if (db_user.preferences.artists[i].name == artist_name) {
                    db_user.preferences.artists.splice(i,1);
                    db_user.save(function(err, data) {
                        if (err) {
                            console.log(err)
                        }
                    });
                    break;
               }
            }
        }
    });
}

exports.removeFriend = function(req, res){

    //Remove a friend from user's mix
    friend = req.body['friend']
    console.log("Friend: ", friend)
    user_id = req.session.user;
    console.log("Friend removed");
    User.findOne({'fb_id': user_id}).exec(function(err, db_user) {
        if (err) {
            console.log(err);
        } else if (!(db_user._id == friend)){
             Mix.findOne({"_id": db_user.mix}).exec(function(err, mix) {
                //Right now only works with 1 user at a time.
                console.log(mix.users)
                for (var i =0; i < mix.users.length; i++) {
                    console.log(mix.users[i], " | ", friend)
                    if (mix.users[i] == friend) {
                        mix.users.splice(i,1);
                        mix.save(function(err, mix) {
                            if (err){
                                console.log(err)
                            } else {
                                console.log("Success")
                            }
                        });
                   }
                }
            });
        }
    });
}

exports.mixUpdate = function(req, res){
    new_friends = req.body['new_friends']
    console.log(new_friends);
    user_id = req.session.user;
    User.findOne({'fb_id': user_id}).exec(function(err, db_user) {
        if (err) {
            console.log(err);
        } else {
            Mix.findOne({"_id": db_user.mix}).exec(function(err, mix) {
                console.log("Mix: ", mix.users);
                console.log("UID: ", new_friends[0])
                console.log("In List: ", mix.users.contains(new_friends[0]));
                //Right now only works with 1 user at a time.
                for(var i=0; i<new_friends.length; i++) {
                    if (!mix.users.contains(new_friends[i])) {
                        mix.users.push(new_friends[i])
                        mix.save(function(err, mix) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(mix);
                            }
                        });
                    }
                }
            });
        }
    });
}

