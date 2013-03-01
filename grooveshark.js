var https = require('https');

exports.make_request = function(data){
  var hmac = require('./hmac-md5');
  var datatest = {method: "startSession", header:{wsKey:process.env.GSHARK_KEY}};
  var datatest1 = {method: "authenticate", parameters:{login:"olinjstest",password:process.env.GSHARK_TESTPASSHASH}, header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}};
  var datatest2 = {method: "getUserPlaylists", header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}};
  var datatest3 = {method: "getPlaylist", parameters:{playlistID:83510028}, header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}};
  var datatest4 = {method: "getStreamKeyStreamServer", parameters:{songID:31591157,country:{ID:223,CC1:0,CC2:0,CC3:0,CC4:1073741824,DMA:506,IPR:0}}, header:{wsKey:process.env.GSHARK_KEY,sessionID:"67309bd2c4ad33a96274131c4165cf8a"}};
  
  var datastring = JSON.stringify(datatest1);
  console.log(datastring);
  var sig = hmac.CryptoJS.HmacMD5(datastring,process.env.GSHARK_SECRET).toString(hmac.CryptoJS.enc.Hex);

  var options = {
    hostname: 'api.grooveshark.com',
    port: 443,
    path: '/ws3.php?sig='+sig,
    method: 'POST',
    headers: {
        'Content-Length': datastring.length
    }
  };

  var req = https.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write(datastring);
  req.end();
};