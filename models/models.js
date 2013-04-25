var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    first_name: String,
    last_name: String,
    fb_id: String,
    friend_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mix: { type: mongoose.Schema.Types.ObjectId, ref: 'Mix' },
    preferences: {artists: [{name: String, weight:Number}],
                    songs: [{name: String, artist: String, weight:Number}]}
});

var mixSchema = mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    preferences: {artists: [{name: String, weight:Number}],
                    songs: [{name: String, artist: String, weight:Number}]}
});

var stationSchema = mongoose.Schema({
    artists: [{name: String, weight: Number}],
    songs: [{name: String, artist: String, weight:Number}],
    location: [Number],
    name: String
})


var User = mongoose.model('User', userSchema);
var Mix = mongoose.model('Mix', mixSchema);
var Station = mongoose.model('Station', stationSchema);

exports.User = User;
exports.Mix = Mix;
exports.Station = Station;
// TODO: Modify userSchema
