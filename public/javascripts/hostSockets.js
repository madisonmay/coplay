$(function() {
    var socket = io.connect('/');
    socket.emit('addToStation',$('#stationID').attr('stationID'));
    socket.emit('setHost',true);
});