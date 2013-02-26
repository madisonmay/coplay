var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/coplay');

var userSchema = mongoose.Schema({
    username: String,
    fb_id: String,
    friend_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mixes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mix' }],
    preferences: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }
});

var mixSchema = mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    preferences: { type: mongoose.Schema.Types.ObjectId, ref: 'Preference' }
});

var preferenceSchema = mongoose.Schema({
    //Should eventually be converted to embedded
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genres' }],
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artists' }],
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Albums' }],
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Songs' }]
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


var User = mongoose.model('User', userSchema);
var Mix = mongoose.model('Mix', mixSchema);
var Preferences = mongoose.model('Preferences', preferenceSchema);
var Genres = mongoose.model('Genres', genreSchema);
var Artists = mongoose.model('Artists', artistSchema);
var Albums = mongoose.model('Albums', albumSchema);
var Songs = mongoose.model('Songs', songSchema);

exports.User = User;
exports.Mix = Mix;
