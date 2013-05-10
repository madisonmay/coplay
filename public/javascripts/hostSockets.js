$(function() {
    var socket = io.connect('coplay.herokuapp.com');
    socket.emit('addToStation',$('#stationID').attr('stationID'));
});