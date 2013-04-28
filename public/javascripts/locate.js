var marker;

function map_setup(map, pos) {
  map.setCenter(pos);
  marker = new google.maps.Marker({
    position: map.getCenter(),
    map: map,
    title: "",
    animation: google.maps.Animation.DROP
  });

  var labelText = "<div style='background-color: white; color: white; margin-top: -160px; margin-left: -35px;" +
                  "border-radius: 70px; height: 100px; width: 100px; font-size: 16px; border: 10px #A0A0A0 solid;'>" +
                  "<img src='/images/home.png' alt='Home' style='width: 60px; margin-top:18px;'></div>";

  var myOptions = {
     content: labelText,
     boxStyle: {
       textAlign: "center",
       fontSize: "16pt",
       width: "50px"
     },
     disableAutoPan: true,
     pixelOffset: new google.maps.Size(-25, 0),
     position: map.getCenter(),
     closeBoxURL: "",
     isHidden: false,
     pane: "mapPane",
     enableEventPropagation: true
  };

  var ib = new InfoBox(myOptions);

  google.maps.event.addListener(marker, 'mouseover', function() {
    ib.open(map, marker);
  });

  google.maps.event.addListener(marker, 'mouseout', function() {
    ib.close();
  });
}

function distance(lat1, lon1) {
// Find the distance between two lat/lon points
  var lat2 = window.latitude
  var lon2 = window.longitude

  var dLat = lat2-lat1;
  var dLon = lon2-lon1;

  dist = Math.sqrt(dLat*dLat + dLon*dLon);
  return dist;
}

function add_marker(map, station) {

  var pos = new google.maps.LatLng(station.location[0], station.location[1]);
  console.log(station.location[0], station.location[1]);
  var dist = distance(station.location[0], station.location[1])
  console.log(dist);

  var new_marker = new google.maps.Marker({
    position: pos,
    map: map,
    title: "",
    animation: google.maps.Animation.DROP
  });

  var labelText = "<div style='background-color: white; overflow: hidden; z-index: 2147483647 !important; -webkit-transform: translateZ(1000); color: white; margin-top: -160px; margin-left: -35px;" +
                  "border-radius: 70px; height: 100px; width: 100px; font-size: 16px; border: 10px #A0A0A0 solid;'>" +
                  "<img src='https://graph.facebook.com/" + station.users[0].fb_id + "/picture?type=large' alt='Home' style='margin-top:18px;'></div>";

  var myOptions = {
     content: labelText,
     boxStyle: {
       textAlign: "center",
       fontSize: "16pt",
       width: "50px"
     },
     disableAutoPan: true,
     pixelOffset: new google.maps.Size(-25, 0),
     position: pos,
     closeBoxURL: "",
     isHidden: false,
     pane: "mapPane",
     enableEventPropagation: true
  };

  var ib = new InfoBox(myOptions);

  google.maps.event.addListener(new_marker, 'mouseover', function() {
    ib.open(map, new_marker);
  });

  google.maps.event.addListener(new_marker, 'mouseout', function() {
    ib.close();
  });

  google.maps.event.addListener(new_marker, 'click', function() {
    console.log('#' + station.name);
    $('.station').children(".station-info[name='" + station.name + "']").toggleClass('hide-this', {duration:500});
  });
}

var user_pos;

function initialize(stations) {
  var mapOptions = {
    zoom: 20,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  if(navigator.geolocation) {
    console.log("HTML5 compatible")
    navigator.geolocation.getCurrentPosition(function(position) {
      window.latitude = position.coords.latitude;
      window.longitude = position.coords.longitude;
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map_setup(map, pos);
      for (var i = 0; i < stations.length; i++) {
        add_marker(map, stations[i])
      }

      var zIndex100 = $('*').filter(function () {
        if ($(this).css('z-index') == 100) {
          $(this).css('z-index', 300);
          return true;
        } else {
          return false;
        }
      });
    })
  } else {
    console.log("Not HTML5 compatible")
    var user_pos;
    var pos = new google.maps.LatLng(geoplugin_latitude(), geoplugin_longitude());
    map_setup(map, pos);
  }
}

$(document).ready(function() {
  var station_created = function(data) {
    console.log('Called back')
    window.location = data;
  };
  $('#add-station').click(function() {
    console.log("Station added!");
    navigator.geolocation.getCurrentPosition(function(position) {
      $.post('/station', {'latitude': position.coords.latitude, 'longitude': position.coords.longitude,
             'name': $('#station-title').val(), 'seed': $('#station-seed').val(), 'seed_type': 'TODO'}, station_created);
    });
  });

  $('#station-info').on('click', '.station', function() {
    $(this).children('.station-info').toggleClass('hide-this', {duration:500});
  });
});
