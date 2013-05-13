$(function() {
    var socket = io.connect('/');
    socket.emit('addToStation',$('#stationID').attr('stationID'));
    socket.emit('setHost',true);
    socket.on('refresh', function (data) {
        location.reload();
    })
    socket.on('updateD3', function (data) {vote_response(data.data)});
});