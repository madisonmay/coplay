$(function() {
    var socket = io.connect('/');
    socket.emit('addToStation',$('#stationID').attr('stationID'));
    socket.emit('setHost',true);
    socket.on('refresh', function (data) {
        location.reload();
    })
    socket.on('updateD3', function (data) {vote_response(data.data)});
    socket.on('userJoined', function(data) {
        var users = JSON.parse(data.users);
        console.log('userJoined');
        for (var i=0; i < users.length; i++) {
            console.log(users[i]);
        }
        populate_users(users);
    });
});