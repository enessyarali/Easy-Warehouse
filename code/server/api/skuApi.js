'use strict';

const express = require('express')
const SKU = require('../model/sku.js')
const SkuDBU = require('../database_utilities/skuDBU.js')

let router = express.Router()

router.get('/api/skus', async (req,res) => {
  // create connection with the db  
  try {
    const db = new SkuDBU('ezwh.db');
    const skuList = await db.loadSKU()
    return res.status(200).json(skuList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

/*
router.post('/api/sku', async (req,res) => {
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
  });*/
  

module.exports = router;