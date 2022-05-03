const express = require('express')

let app = express.Router()

app.post('/api/sku', async (req,res) => {
    if (req.body === undefined || req.body.description === undefined || req.body.weight === undefined || 
        req.body.volume === undefined || req.body.price == undefined || req.body.notes === undefined || 
        req.body.availableQuantity === undefined ) {
      return res.status(422).json({error: `Invalid SKU data.`});
    }
    try{
        await addSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity)
        return res.status(201).end();
    }
    catch(error){
        return res.status(503).json({error: `Something went wrong.`})
    }
  });
  

module.exports = app