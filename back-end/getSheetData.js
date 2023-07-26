async function getSheets(callback){ //client instance
    var fs = require('fs');
    const {google} = require("googleapis");
    const auth = new google.auth.GoogleAuth({
        keyFile:"molly-and-stitch-fulfillment-4f75556c9f54.json",
        scopes:"https://www.googleapis.com/auth/spreadsheets"
      });
    
      function InvItems (barcode,qty){
        this.barcode = barcode;
        this.qty = qty;
      };
      //client instance
    
      const client =  await auth.getClient();
    
      // googlesheets instance
    
      const googleSheets = google.sheets({version: "v4", auth:client});
      const spreadsheetId = "1etlDo-79jDPxf9m-6Nwbr6_73VAiwBzxdKVp1XTDoUk";
      
      // get metadata about spreadsheet
      const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    
      });
    
      //read rows from spreadsheet
      const getRows = await googleSheets.spreadsheets.values.batchGet({
        auth,
        spreadsheetId,
        ranges: ["Butter Collar!E2:F91",
        "Butter Retriever Collar!E2:F52",
        "City Leash!E2:F52",
        "2x Leash!E2:F52",
        "3x Leash!E2:F52",
        "Harness!E2:F117",
        "TOL Collar !E2:F112",
        "TOL/Maritime Leash!E2:F195",
      ]
      });
    
    let formattedData =[];
    let sheetData = getRows.data.valueRanges;
    
    sheetData.map(item =>{
      for(var valuesCounter = 0; valuesCounter < item.values.length; valuesCounter++){
        let myItem = item.values[valuesCounter];
        formattedData.push(new InvItems(myItem[0],myItem[1]));
      }
    })
  fs.writeFile('../JSON/fetchedData.json', JSON.stringify(formattedData,null,2), err => {
    if (err) {
     console.log('Error writing file', err)
   } else {
     console.log('fetched data')
     callback();
     }
   })
  }
  module.exports.getSheets = getSheets;
  