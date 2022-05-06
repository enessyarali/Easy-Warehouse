'use strict';

const express = require('express')
const SKU = require('../model/sku.js')
const SkuDBU = require('../database_utilities/skuDBU.js')
const Error = require('../model/error')

let router = express.Router()

//TODO - add all checks! (is availableQuantity > 0? is price>0?)

// GET /api/skus
// retrieves all skus from the database
router.get('/api/skus', async (req,res) => {
  // create connection with the db  
  try {
    const db = new SkuDBU('ezwh.db');
    const skuList = await db.loadSKU();
    return res.status(200).json(skuList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});

// POST /api/sku
// add a new sku to the database
router.post('/api/sku', async (req,res) => {
  if (req.body === undefined || req.body.description === undefined || req.body.weight === undefined || 
      req.body.volume === undefined || req.body.price == undefined || req.body.notes === undefined || 
      req.body.availableQuantity === undefined ) {
    return res.status(422).json({error: `Invalid SKU data.`});
  }
  try{
      const db = new SkuDBU('ezwh.db');
      await db.insertSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/sku/:id
// modify a sku in the database
router.put('/api/sku/:id', async (req,res) => {
  if (req.body === undefined || req.body.newDescription === undefined || req.body.newWeight === undefined || 
      req.body.newVolume === undefined || req.body.newPrice == undefined || req.body.newNotes === undefined || 
      req.body.newAvailableQuantity === undefined || req.params === undefined || req.params.id === undefined) {
    return res.status(422).json({error: `Invalid SKU data.`});
  }
  try{
      const db = new SkuDBU('ezwh.db');
      // get the sku to be modified
      const skuList = await db.loadSKU(req.params.id);
      const sku = skuList.pop();
      if (!sku) {
        // then the inserted id did not match any sku
        return res.status(404).json({error: `No SKU matches the id ${req.params.id}.`});
      }
      try {
        sku.modify(db.db, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity)
      } catch (err) {
        if(err.code===4)
          return res.status(422).json({error: `The assigned position cannot store the SKU anymore. Update aborted.`});
        else return res.status(503).json({error: `Something went wrong...`, message: err.message});
      }
      await db.updateSKU(sku);
      return res.status(200).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// PUT /api/sku/:id/position
// assign a position to a sku
router.put('/api/sku/:id/position', async (req,res) => {
  if (req.body === undefined || req.body.position === undefined || req.params === undefined || req.params.id === undefined) {
    return res.status(422).json({error: `Invalid data.`});
  }
  try{
      const db = new SkuDBU('ezwh.db');
      // see if the position is already assigned to another SKU
      const isBusy = await db.searchAssignedPosition(req.body.position);
      if (isBusy) {
        return res.status(422).json({error: 'The provided position is already assigned to another SKU. Update aborted.'});
      }
      // get the sku to be modified
      const skuList = await db.loadSKU(req.params.id);
      const sku = skuList.pop();
      if (!sku) {
        // then the inserted id did not match any sku
        return res.status(404).json({error: `No SKU matches the id ${req.params.id}.`});
      }
      try {
        await sku.setPosition(db.db, req.body.position);
      } catch (err) {
        if (err.code==4)
          return res.status(422).json({error: `Position cannot store the required SKU. Operation aborted.`});
        if (err.code==5)
          return res.status(404).json({error: `No position matches the id ${req.body.position}.`});
        else return res.status(503).json({error: `Something went wrong...`, message: err.message});
      }
      await db.updateSKU(sku);
      return res.status(200).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// DELETE /api/sku
// remove a sku from the database
router.delete('/api/sku/:id', async (req,res) => {
  if (req.params === undefined || req.params.id === undefined) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new SkuDBU('ezwh.db');
      // get the sku to be deleted
      const skuList = await db.loadSKU(req.params.id);
      const sku = skuList.pop();
      if (!sku) {
        // then the inserted id did not match any sku
        return res.status(404).json({error: `No SKU matches the id ${req.params.id}.`});
      }
      sku.delete(db.db);
      // now, delete the sku
      await db.deleteSKU(req.params.id);
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});
  

module.exports = router;