var http = require('follow-redirects').http;
var fs = require('fs');

async function filterData(){
  let ordersQty = [];
  let inventoryQty = [];
  let unfulfilledOrdersData = [];
  var inventory,orders;
var options1 = {
  'method': 'GET',
  'hostname': 'localhost',
  'port': 8081,
  'path': '/unfulfilledOrders.json',
  'headers': {
  },
  'maxRedirects': 20
};
var options2 = {
    'method': 'GET',
    'hostname': 'localhost',
    'port': 8081,
    'path': '/fetchedData.json',
    'headers': {
    },
    'maxRedirects': 20
  };
//orders quantity
var req1 = http.request(options1, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

 res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    orders = JSON.parse(body.toString());
    for (var i = 0; i < orders.length; i++) {
      let data = orders[i].itemsQuantity;
      ordersQty.push(...data);
    }

  });

  res.on("error", function (error) {
    console.error(error);
  });
});


//inventory quantity
var req2 = http.request(options2, function (res) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      inventory = JSON.parse(body.toString());
      for(var i=0; i < inventory.length; i++){
        let data = inventory[i];
        inventoryQty.push(data);
    }
    for(var ordersCounter = 0 ; ordersCounter < ordersQty.length ; ordersCounter++){
      inventoryQty.findIndex(function(inv){
        if(inv.barcode  == ordersQty[ordersCounter].barcode){
          if(inv.qty < ordersQty[ordersCounter].qty){
            for(var orderCount = 0; orderCount < orders.length ; orderCount++){
              if(orders[orderCount].itemsSku.indexOf(ordersQty[ordersCounter].barcode) != -1){
                unfulfilledOrdersData.push(orders[orderCount])
                orders.splice(orderCount,1);
              }
            }
            
          }
        }else{

        }
      })
    }
    fs.writeFile('../JSON/filteredData.json', JSON.stringify(orders,null,2), err => {
      if (err) {
       console.log('Error writing file', err)
     } else {
       console.log('updated unfulfilled orders')
       }
     })
     fs.writeFile('../JSON/outOfStock.json', JSON.stringify(unfulfilledOrdersData,null,2), err => {
      if (err) {
       console.log('Error writing file', err)
     } else {
       console.log('updated unfulfilled orders')
       }
     })
    });
    
  
    res.on("error", function (error) {
      console.error(error);
    });
  });
  req1.end();
  req2.end();
}
module.exports.filterData = filterData;