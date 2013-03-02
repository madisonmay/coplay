
var Models = require('../models/models.js');
var User = Models.User;

exports.landing_page = function(req, res){
    //Main page for mixing and welcome page
    User.findOne({fb_id : req.session.user}).exec(function(err, db_user) {

        console.log(db_user);

        if (db_user) {
            res.render('login', {'title': 'CoPlay', 'user': db_user, 'logged_in': true});
        }

        else {
            res.render('login', {'title': 'CoPlay', 'logged_in': false});
        }
    });
};

exports.login = function(req, res){
    //Handles facebook authentication
    console.log("Logged in")
    req.facebook.api('/me', function(err, user) {
        User.find({fb_id : user.id}).exec(function(err, db_user) {

            console.log(err, user);
            console.log(db_user);

            if (db_user.length == 1) {
                req.session.user = db_user[0].fb_id;
                res.redirect('/');
            }

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

            else {
                res.send("CoPlay is currently experiencing issues.");
            }
        });
    });
};

exports.logout = function(req, res){
    req.facebook.getLogoutUrl({next: 'http://localhost:3000/refresh'}, function(err, url) {
        if (err) {
            console.log(err);
        } else {
            console.log(url);
            res.redirect(url);
        }
    });
};

exports.refresh = function(req, res){
    req.session.destroy();
    res.redirect('/');
};

exports.settings = function(req, res){
    if (req.session.user) {
        logged_in = true
    } else {
        logged_in = false
    }
    console.log(logged_in, "Logged")
    res.render("settings", {title: 'CoPlay', logged_in: logged_in});
};




