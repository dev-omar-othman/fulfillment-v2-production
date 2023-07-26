 async function setSheets(passedSku){ //client instance
 

  const {google} = require("googleapis");
  const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:"https://www.googleapis.com/auth/spreadsheets"
  });

  const client =  await auth.getClient();

  // googlesheets instance

  const googleSheets = google.sheets({version: "v4", auth:client});
  const spreadsheetId = "1etlDo-79jDPxf9m-6Nwbr6_73VAiwBzxdKVp1XTDoUk";
  
  // get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,

  });
  var sku= [];
  for(let i = 0; i < passedSku.length; i++){
    let singleSku = [passedSku[i]]
   sku.push(singleSku)
  }
  //write row(s) to spreadsheet
 await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range:"Out",
    valueInputOption:"RAW",
    resource:{
      values:sku
    }
  })
  console.log('set Sheets')
}
module.exports.setSheets = setSheets;
