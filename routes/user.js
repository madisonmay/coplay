
var Models = require('../models/models.js');
var User = Models.User;

exports.landing_page = function(req, res){
    //Main page for mixing and welcome page
    User.findOne({fb_id : req.session.user}).exec(function(err, db_user) {

        console.log(db_user);

        if (db_user) {
            var data = [{name: 'Derek', id: 1}, {name: 'Tom', id: 2}, {name:'Madison', id: 3}];
            var data2 = [{name: 'Derek', id: 1}, {name: 'Tom', id: 2}, {name:'Madison', id: 3}];
            res.render('home', {'title': 'CoPlay: Social Music At Its Finest', 'user': db_user, 'logged_in': true, 'friends': JSON.stringify(data), 'other_friends': data2});
        }

        else {
            res.render('landing', {'title': 'CoPlay: Social Music At Its Finest', 'logged_in': false});
        }
    });
};
exports.about = function(req, res){
    res.render("about", {title: 'CoPlay', logged_in: false});
};

exports.login = function(req, res){
    //Handles facebook authentication
    console.log("Logged in")
    req.facebook.api('/me', function(err, user) {
        User.find({fb_id : user.id}).exec(function(err, db_user) {

            console.log(err, user);
            console.log(db_user);

            //User in database
            if (db_user.length == 1) {
                req.session.user = db_user[0].fb_id;
                res.redirect('/');
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
                    res.redirect('/');
                });
            }

            //Something else unexpected happens
            else {
                res.send("CoPlay is currently experiencing issues.");
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
            res.redirect(url);
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
    if (req.session.user) {
        logged_in = true
    } else {
        logged_in = false
    }
    console.log(logged_in, "Logged")
    res.render("settings", {title: 'CoPlay: Adjust mix', logged_in: logged_in});
};

exports.addFriend = function(req, res){
    console.log(req.body['friend'])
    console.log("Friend added");
}

exports.addArtist = function(req, res){
    console.log("Artist added");
    console.log(req.body['artist']);
}

exports.editArtist = function(req, res){
    console.log("Artist values edited");
    console.log(req.body['artists'])
}

exports.removeArtist = function(req, res){
    console.log("Artist removed");
    console.log(req.body['artist']);
}

exports.removeFriend = function(req, res){
    console.log(req.body['friend']);
}


