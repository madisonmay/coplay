var https = require('https');

exports.make_request = function(data,callback){
  var hmac = require('./hmac-md5');
  var datastring = JSON.stringify(data);
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
  var data = "";
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      callback(JSON.parse(data));
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write(datastring);
  req.end();
};