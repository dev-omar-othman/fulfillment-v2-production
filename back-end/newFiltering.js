async function filterMe(callback){
var fs = require('fs');
var inventory = JSON.parse(fs.readFileSync('../JSON/fetchedData.json','utf-8'));
var tempInv = inventory;
var orders = JSON.parse(fs.readFileSync('../JSON/unfulfilledOrders.json','utf-8')).sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
var ordersToFulfill = [];
var ordersCantBeFulfilled = []

function canFulfilOrder(order) {
    var items = order.itemsQuantity;
    for(var i = 0; i < items.length; i++){
        var itemExists = false;
        for(var y = 0; y < tempInv.length; y++){
            if(items[i].barcode == tempInv[y].barcode){
                itemExists = true;
                if (items[i].qty <= tempInv[y].qty){
                    tempInv[y].qty -= items[i].qty
                }
                else {
                    tempInv = inventory;
                    return false;
                }
            }
        }
        if(itemExists == false){
            tempInv = inventory;
            return false;
        }
    }
    inventory = tempInv;
    return true;
}

 function displayOrdersWeCanFulfill(){
   for(var i = 0; i < orders.length; i++){
        if(canFulfilOrder(orders[i])){
            ordersToFulfill.push(orders[i])
        }
        else {
            ordersCantBeFulfilled.push(orders[i])
        }
    }
    ordersToFulfill = ordersToFulfill.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
    ordersCantBeFulfilled = ordersCantBeFulfilled.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
    fs.writeFile('../JSON/ordersToFulfill.json', JSON.stringify(ordersToFulfill,null,2), err => {
        if (err) {
         console.log('Error writing file', err)
       } else {
         console.log('updated orders we can fulfil')
         callback()
         }
       })

       fs.writeFile('../JSON/ordersCantBeFulfilled.json', JSON.stringify(ordersCantBeFulfilled,null,2), err => {
        if (err) {
         console.log('Error writing file', err)
       } else {
         console.log("updated orders we can't fulfil")
         
         }
       })
}
displayOrdersWeCanFulfill();

}
module.exports.filterMe = filterMe;