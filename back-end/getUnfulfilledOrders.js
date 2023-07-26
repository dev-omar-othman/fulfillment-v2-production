var https = require('follow-redirects').https;
var fs = require('fs');
var async = require("async");
let finalOrders = []

async function getOrders(callback){
    var options = {
        'method': 'GET',
        'hostname': 'mollyandstitchus.myshopify.com',
        'path': '/admin/api/2021-07/orders.json?fulfillment_status=unshipped&limit=250&gift_card=false',
        'headers': {
            'Authorization': 'Basic OTJjOWE3NDdmMjZmODgzNjM4OGM4NDFhMDYzZjMwZDI6c2hwcGFfNDg4NDNmNTNjNDYyZmI5OGRiY2U2ZjI2NDBlNzE2MjY='
        },
        'maxRedirects': 20
    };

    function Items (barcode,qty){
        this.barcode = barcode;
        this.qty = qty;
    };

    var req = https.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end",async function (chunk) {
            var body = Buffer.concat(chunks);
            var orders = JSON.parse(body.toString());
            for(var i = 0; i < orders.orders.length; i++){
                let orderData = {
                    orderNumber : orders.orders[i].id,
                    orderTotalPrice : orders.orders[i].total_price,
                    orderId: orders.orders[i].name,
                    destination1: orders.orders[i].shipping_address.address1 ,
                    destination2: orders.orders[i].shipping_address.address2 ,
                    postalCode : orders.orders[i].shipping_address.zip,
                    countryCode : orders.orders[i].shipping_address.country_code,
                    state : orders.orders[i].shipping_address.province_code,
                    city : orders.orders[i].shipping_address.city,
                    customer: orders.orders[i].shipping_address.name,
                    itemsSku:[],
                    itemsQuantity:[],
                    orderDescription:[],
                    orderDate : new Date (orders.orders[i].created_at),
                }

                // Send a request to get the fulfillment_order_id
                var fulfillmentOptions = {
                    'method': 'GET',
                    'hostname': 'mollyandstitchus.myshopify.com',
                    'path': `/admin/api/2023-07/orders/${orderData.orderNumber}/fulfillment_orders.json`,
                    'headers': {
                        'Authorization': 'Basic OTJjOWE3NDdmMjZmODgzNjM4OGM4NDFhMDYzZjMwZDI6c2hwcGFfNDg4NDNmNTNjNDYyZmI5OGRiY2U2ZjI2NDBlNzE2MjY='
                    },
                    'maxRedirects': 20
                };

                var fulfillmentReq = await new Promise((resolve, reject) => {
                    https.request(fulfillmentOptions, function (res) {
                        var chunks = [];
                        
                        res.on("data", function (chunk) {
                            chunks.push(chunk);
                        });

                        res.on("end", function (chunk) {
                            var body = Buffer.concat(chunks);
                            var fulfillmentOrders = JSON.parse(body.toString());

                            if(fulfillmentOrders.fulfillment_orders && fulfillmentOrders.fulfillment_orders.length > 0) {
                                resolve(fulfillmentOrders.fulfillment_orders[0].id);
                            } else {
                                reject(fulfillmentOrders.fulfillment_orders[0].id);
                            }
                        });
                    }).on("error", function (error) {
                        reject(error);
                    }).end();
                }).catch(err => {
                    console.error(err);
                    return null;
                });

                orderData.fulfillment_order_id = fulfillmentReq;

                for(var j = 0; orders.orders[i].line_items.length > j ; j++){
                    for(var quantityCounter = 0; quantityCounter < orders.orders[i].line_items[j].fulfillable_quantity; quantityCounter++ ){
                        orderData.orderDescription.push (orders.orders[i].line_items[j].title +" "+ orders.orders[i].line_items[j].variant_title);
                        orderData.itemsSku.push(orders.orders[i].line_items[j].sku);
                        orderData.itemsQuantity.push(new Items(orders.orders[i].line_items[j].sku,(orders.orders[i].line_items[j].fulfillable_quantity / orders.orders[i].line_items[j].fulfillable_quantity)));
                    }
                }
                finalOrders.push(orderData);
            }

            fs.writeFile('../JSON/unfulfilledOrders.json', JSON.stringify(finalOrders,null,2), err => {
                if (err) {
                    console.log('Error writing file', err);
                } else {
                    console.log('fetched unfulfilled orders');
                    callback();
                }
            });
            finalOrders = [];
        });

        res.on("error", function (error) {
            console.error(error);
        });
    });

    req.end();
}

module.exports.getOrders = getOrders;
module.exports.finalOrders = finalOrders;
