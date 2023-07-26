var https = require('follow-redirects').https;
var fs = require('fs');
async function setPostData(newData,callback){
var postData = newData;
var options = {
  'method': 'POST',
  'hostname': 'api.sendle.com',
  'path': '/api/orders',
  'headers': {
    'Origin': '',
    'Authorization': 'Basic ZWR3YXJkX21vbGx5YW5kc3RpdGM6WkZxTjdLdlA0eXBmajYzS3dGNDdXQzVt',
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};

  var req = https.request(options, function (res) {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      global.sendleRes = body.toString();
      if(body.toString().indexOf("message") != -1){
        callback();
        return
      }else{
      global.shippingLabel = JSON.parse(body.toString()).labels[1].url;
      global.trackingUrl = JSON.parse(body.toString()).tracking_url;
      global.trackingNo = JSON.parse(body.toString()).sendle_reference;
      callback();
      }
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
  
   req.write(postData);
  
  req.end();

}
module.exports.setPostData = setPostData;
