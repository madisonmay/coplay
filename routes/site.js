
exports.about = function(req, res){
    res.send("About page placeholder");
};

exports.home = function(req, res){
    res.render("home", {title: 'CoPlay'});
};
