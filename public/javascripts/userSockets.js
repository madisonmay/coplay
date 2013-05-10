$(function() {
    var socket = io.connect('coplay.herokuapp.com');
    socket.emit('addToStation',$('#stationID').attr('stationID'));
    socket.on('update', function (data) {
        $("#songName").text(data.title + ' by ' + data.artist);
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
    socket.on('redirect', function (data){
        window.location.href = data.url;
    });
});