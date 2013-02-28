var https = require('https');

exports.make_request = function(data){
  var hmac = require('./hmac-md5');
  //var datatest = {method: "startSession", header:{wsKey:process.env.GSHARK_KEY}};
  var datastring = JSON.stringify(data);
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