var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/coplay');

var userSchema = mongoose.Schema({
    username: String,
    fb_id: String,
    friend_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mixes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mix' }],
    preferences: preferenceSchema
});

var genreSchema = mongoose.Schema({
    genre: String,
    weight: Number
});

var artistSchema = mongoose.Schema({
    artist: String,
    weight: Number
});

var albumSchema = mongoose.Schema({
    album: String,
    weight: Number
});

var songSchema = mongoose.Schema({
    song: String,
    weight: Number
});

var preferenceSchema = mongoose.Schema({
    artists: [{name: String, weight:Number}],
    songs: [{name: String, artist: String, weight:Number}}]
});

var mixSchema = mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    preferences: preferenceSchema
});


var User = mongoose.model('User', userSchema);
var Mix = mongoose.model('Mix', mixSchema);
var Genres = mongoose.model('Genres', genreSchema);
var Artists = mongoose.model('Artists', artistSchema);
var Albums = mongoose.model('Albums', albumSchema);
var Songs = mongoose.model('Songs', songSchema);
var Preferences = mongoose.model('Preferences', preferenceSchema);

exports.User = User;
exports.Mix = Mix;
