const express = require("express");
const mysql = require("mysql");
var fs = require('fs');
var cors = require('cors');
var async = require('async');
var http = require('http');
const port = process.env.PORT || 8081;
const app = express();
var server = http.createServer(app);
const {google} = require("googleapis");

var db = mysql.createConnection({
  host     : 'fulfillmentapp.cmva2pijtmrz.us-east-2.rds.amazonaws.com',
  user     : 'fulfillmentapp',
  password : 'ms_app2022!',
  database : 'sys',
  port     : 3306
});

db.connect((err) => {
  if(err){
    console.log("database not connected");
  }
  console.log("database connected")
});
/*
//create DB
app.get('/createdb', (req, res) => {
  let sql = "CREATE DATABASE inventory";
  db.query(sql , (err,  result) =>{
    if(err){
      console.log("database not created")
    }
    console.log(result);
    res.send("DATABASE CREATED")
  });
});

//create table
app.get("/createorderstable", (req, res) =>{
  let sql = "CREATE TABLE orders(id int AUTO_INCREMENT, title VARCHAR(225), body VARCHAR(255), PRIMARY KEY(id))";
  db.query(sql, (err, result) =>{
    if(err) {
      throw err;
    }
    console.log(result);
    res.send("orders table created");
  });
});
*/


//select data

app.get("/getinventory", (req, res) => {
  let sql = `SELECT Barcode, Quantity FROM all_products`;
  let query = db.query(sql, (err, result) =>{
    if(err) {
      throw err;
    }
    fs.writeFile('../JSON/database_inv.json', JSON.stringify(result,null,2), err => {
      if (err) {
       console.log('Error writing file', err)
     } else {
       console.log('fetched database inventory');
       }
     })
    res.send("inventory fetched from DB");
  });
});

//select logs file and update it
app.get("/getlogs", (req, res) => {
  req.headers["mode"] = "no-cors";
  let sql = `SELECT * FROM fulfilled_orders`;
  let query = db.query(sql, (err, result) =>{
    if(err) {
      throw err;
    }
    fs.writeFile('../JSON/logs.json', JSON.stringify(result,null,2), err => {
      if (err) {
       console.log('Error writing file', err)
     } else {
       console.log('fetched database inventory');
       }
     })
     res.header("Access-Control-Allow-Origin", "*");
    res.send("inventory fetched from DB");
  });
});
//update inventory

app.get("/updatequantitydb", (req, res) => {
  req.headers["mode"] = "no-cors";
  
  for(var i = 0; i< JSON.parse(req.query.data).length ; i++){
    console.log(req.query.data);
      let sql_set = `UPDATE all_products
      SET Quantity = Quantity - 1
      WHERE Barcode = ${JSON.parse(req.query.data)[i]};`;
      let query_set = db.query(sql_set, (err, result) =>{
        if(err) {
          throw err;
        }
  });
}
    res.header("Access-Control-Allow-Origin", "*");
    res.send("inventory updated on DB");
  });
//select single order
app.get("/getinventory/:Product_Name", (req, res) => {

  let sql = `SELECT * FROM all_products WHERE Product_Name = "${req.params.Product_Name}"`;
  let query = db.query(sql, (err, result) =>{
    if(err) {
      throw err;
    }
    fs.writeFile('../JSON/inventory.json', JSON.stringify(result,null,2), err => {
      if (err) {
       console.log('Error writing file', err)
     } else {
       console.log('fetched database inventory');
       }
     })
     res.header("Access-Control-Allow-Origin", "*");
    res.send("inventory fetched from DB");
  });
});

//select single order
app.get("/updateorder/:id", (req, res) => {
let newTitle = "updated title";
  let sql = `UPDATE orders SET title = "${newTitle}" WHERE id = ${req.params.id}`;
  let query = db.query(sql, (err, result) =>{
    if(err) {
      throw err;
    }
    console.log(result);
    res.send("order updated");
  });
});
// use it before all route definitions
app.use(cors({origin: '*'}));
app.use(express.static("../JSON",{etag: false})); // exposes index.html, per below
// get unfulfilled orders from shopify
app.get("/getorders", async function(req,res){
  req.headers["mode"] = "no-cors";
  await require('./getUnfulfilledOrders').getOrders(sendResponse);
  function sendResponse(){
    res.send("orders fetched");
  }
});
//get  inventory from the sheet
app.get("/getdata", async function(req,res){
  req.headers["mode"] = "no-cors";
  await require('./getSheetData').getSheets(sendResponse);
  function sendResponse(){
    res.send("orders fetched")
  }
});
//filter data based on inventory and fetched orders
app.get("/filterdata", async function(req,res){
  req.headers["mode"] = "no-cors";
  await require('./newFiltering').filterMe(sendResponse);
  function sendResponse(){
    res.send("orders fetched")
  }
});

//send to logs
app.get("/markFulfilled",function(req,res){
  req.headers["mode"] = "no-cors";

    //insert data

  let sql = `INSERT INTO fulfilled_orders (order_id, customer, country, items_sku, items_description, created_at, fulfilled_at,label)
  VALUES ('${req.query.orderid}', '${req.query.customer}', '${req.query.destination}', '${req.query.itemsSku}', '${req.query.description}', '${req.query.fulfillingDate}', CURRENT_TIMESTAMP, '${req.query.label}');`;
  let query = db.query(sql, (err, result) =>{
    if(err) {
      throw err;
    }
    console.log(result);
    res.send("order added");
  });
});

//sendle request
app.get('/updateData', async function(req,res){
  req.headers['mode'] = 'no-cors';
  await require('./testPrcel').setPostData(req.query.data, sendResponse);
  function sendResponse(){
    res.send({body: {
      response :global.sendleRes,
      label :global.shippingLabel,
      url : global.trackingUrl,
      trackingNo : global.trackingNo,    
     }
   })
  }
});
//google sheet fulfillment
app.get("/fulfillSheets", async (req , res) =>{
  require('./setInventory').setSheets(JSON.parse(req.query.data));
  res.send("sheet updated");
});

// shopify fulfillment
app.get("/fulfillShopify", async (req , res) =>{
  await require('./shopifyFulfillment').shopifyFulfillment(req.query.orderid , req.query.trackingUrl,req.query.trackingNo, sendResponse);
  function sendResponse(){
    res.send({
      data : {
        response : global.shopifyRes
      }
    });
  }
});


server.listen(port,() => console.log(`running on ${port}`));
