$(function() {
    console.log('socket')
    var socket = io.connect('/');
    socket.emit('addToStation',$('#stationID').attr('stationID'));
    socket.emit('setHost',false);
    socket.on('update', function (data) {
        $("#songName").text(data.title);
        $("#artistName").text(data.artist);
        $("#songName").attr({'name': data.title, 'artist': data.artist});
        $("#album-art").html("");

        if (data.artwork) {
            $("#album-art").append("<img src='http://beta.grooveshark.com/static/amazonart/l" +
                                    data.artwork + "' class='album-art'></img>")
        } else {
            $("#album-art").html("<img src='http://beta.grooveshark.com/static/albums/500_album.png" +
                                 "' class='album-art'></img>");
        }
    });
    socket.on('refresh', function (data) {
        location.reload();
    })
    socket.on('redirect', function (data){
        window.location.href = data.url;
    });
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