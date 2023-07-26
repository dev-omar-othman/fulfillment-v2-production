//send to logs
app.get("/markFulfilled",function(req,res){
    req.headers["mode"] = "no-cors";

      //insert data
  
    let sql = `INSERT INTO fulfilled_orders (order_id, customer, country, items_sku, items_description, created_at, fulfilled_at,label)
    VALUES (${req.query.orderid}, ${req.query.customer}, ${req.query.destination}, ${req.query.itemsSku}, ${req.query.description}, ${req.query.fulfillingDate}, SELECT CURRENT_TIMESTAMP, ${req.query.req.query.label});`;
    let query = db.query(sql, (err, result) =>{
      if(err) {
        throw err;
      }
      console.log(result);
      res.send("order added");
    });
  });
  ///////____________________________
  
//send to logs
app.get("/markFulfilled", async function(req,res){
    req.headers["mode"] = "no-cors";
    await require('./fillLogs').fillLogs(
      req.query.fulfillingDate ,
      req.query.orderid,
      req.query.totalPrice,
      req.query.customer,
      req.query.destination,
      req.query.itemsSku,
      req.query.description,
      req.query.label,
      sendResponse);
      //insert data
  
    let sql = `INSERT INTO fulfilled_orders (order_id, customer, country, items_sku, items_description, created_at, fulfilled_at,label)
    VALUES (${req.query.orderid}, ${req.query.customer}, ${req.query.destination}, ${req.query.itemsSku}, ${req.query.description}, ${req.query.fulfillingDate}, SELECT CURRENT_TIMESTAMP, ${req.query.req.query.label});`;
    let query = db.query(sql, (err, result) =>{
      if(err) {
        throw err;
      }
      console.log(result);
      res.send("order added");
    });
    function sendResponse(){
      res.send("marked fulfilled")
    }
  });