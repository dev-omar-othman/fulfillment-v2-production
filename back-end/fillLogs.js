async function fillLogs(fulfillingDate, orderid, totalPrice, customer,destination, itemsSku, description, label,callback){
    var fs = require('fs');
    var oldLogs = JSON.parse(fs.readFileSync('../JSON/logs.json','utf-8'));
    var newLog = {
        fulfillingDate,
        orderid,
        totalPrice,
        customer,
        destination,
        itemsSku,
        description,
        label
    }
    var allLogs = newLog + oldLogs;
    fs.writeFile('../JSON/logs.json', JSON.stringify(allLogs,null,2), err => {
        if (err) {
         console.log('Error writing file', err)
       } else {
         console.log('marked fulfilled');
         callback();
         }
       })
       allLogs = [];
    }
module.exports.fillLogs = fillLogs;