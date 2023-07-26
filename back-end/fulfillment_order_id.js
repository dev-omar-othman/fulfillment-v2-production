var options_5 = {
  'method': 'GET',
  'hostname': 'mollyandstitchus.myshopify.com',
  'path': '/admin/api/2023-07/orders/5323189879030/fulfillment_orders.json?id=null',
  'headers': {
    'Authorization': 'Basic OTJjOWE3NDdmMjZmODgzNjM4OGM4NDFhMDYzZjMwZDI6c2hwcGFfNDg4NDNmNTNjNDYyZmI5OGRiY2U2ZjI2NDBlNzE2MjY='
  },
  'maxRedirects': 20
};

var required = https.request(options_5, function (response) {
  var chunks = [];

  response.on("data", function (chunk) {
    chunks.push(chunk);
  });

  response.on("end", function () {
    var body = Buffer.concat(chunks);
    // Parse the JSON response
    var jsonResponse = JSON.parse(body);

    // Extract the 'id' from the response
    var fulfillment_order_id = jsonResponse.fulfillment_orders[0].id;
    console.log(fulfillment_order_id);
  });

  response.on("error", function (error) {
    console.error(error);
  });
});

required.end();

