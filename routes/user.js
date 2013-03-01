


exports.landing_page = function(req, res){
    res.render('login', {'title': 'CoPlay'});
};

exports.login = function(req, res){
    console.log("Logged in")

    req.facebook.api('/me', function(err, user) {
        User.find({id : user.id}).exec(function(err, db_user) {


            if (db_user.length == 1) {
                req.session.user = db_user[0].fb_id;
                res.redirect('/');
            }

            else if (!db_user.length) {
                var new_user = new User({username: user.name, fb_id: user.id});
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
    res.send('Placeholder for logout handler');
};

exports.settings = function(req, res){
    res.render("settings", {title: 'CoPlay'});
};




