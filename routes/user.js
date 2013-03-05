var Models = require('../models/models.js');
var User = Models.User;
var Mix = Models.Mix

exports.landing_page = function(req, res){
    //Main page for mixing and welcome page
    User.findOne({fb_id : req.session.user}).populate('friend_list').exec(function(err, db_user) {

        if (db_user) {

            console.log(db_user.friend_list);
            var data = [{name: 'Derek', id: 1}, {name: 'Tom', id: 2}, {name:'Madison', id: 3}];
            var data2 = db_user.friend_list;
            res.render('home', {'title': 'Coplay: Social Music At Its Finest', 'user': db_user, 'logged_in': true, 'friends': JSON.stringify(data), 'other_friends': data2});
        }

        else {
            res.render('landing', {'title': 'Coplay: Social Music At Its Finest', 'logged_in': false});
        }
    });
};
exports.about = function(req, res){
    res.render("about", {title: 'Coplay', logged_in: false});
};

function get_friends(fb_id, req, res, callback){
    var curr = 0;
    var max;

    function save_try(friends, friend_list, i) {
        curr += 1;
        if (curr == max){
            console.log(friend_list);
            console.log("Friend list: ", friend_list);
            console.log("Callback:", callback);
            callback(friend_list);
        }
    }

    function db_query(friends, friend_list, i) {
        User.findOne({'fb_id': friends.data[i].id}, function(err, db_user){
            if (db_user) {
                console.log(friends.data[i].id)
                console.log("DB_USER", db_user);
                friend_list.push(db_user);
                console.log("Friend list:", friend_list);
            }
            return save_try(friends, friend_list);
        });
    };

    req.facebook.api('/me/friends?', function(err, friends) {
        max = friends.data.length;
        var friend_list = [];
        for (var i=0; i<friends.data.length; i++){
            db_query(friends, friend_list, i);
        }

    });
}

exports.login = function(req, res){
    //Handles facebook authentication
    console.log("Logged in")
    req.facebook.api('/me', function(err, user) {
        User.findOne({fb_id : user.id}).exec(function(err, db_user) {

            console.log(err, user);
            console.log("db_user", db_user);

            //User in database
            if (db_user) {
                req.session.user = db_user.fb_id;
                get_friends(db_user.fb_id, req, res, function(friend_list){
                    db_user.friend_list = friend_list;
                    db_user.save();
                    res.redirect('/');
                });
            }

            //User DNE
            else if (!db_user.length) {
                var new_user = new User({username: user.name, fb_id: user.id, first_name: user.first_name,
                                         last_name: user.last_name});
                new_user.save(function(err) {
                    if(err) {
                        console.log("Error: ", err);
                    }
                    req.session.user = new_user.fb_id;
                    get_friends(new_user.fb_id, req, res, function(friend_list){
                        db_user.friend_list = friend_list;
                        db_user.save();
                        res.redirect('/');
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

    //Redirect to facebook logout url
    req.facebook.getLogoutUrl({next: 'http://localhost:5000/refresh/'}, function(err, url) {
        if (err) {
            console.log(err);
        } else {
            console.log(url);
            req.session.destroy();
            res.redirect('/');
        }
    });
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
                    db_user.save();
                    break;
               }
            }
        }
    });
}

exports.removeFriend = function(req, res){
    console.log(req.body['friend']);
}


