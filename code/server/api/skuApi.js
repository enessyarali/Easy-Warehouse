'use strict';

const express = require('express');
const SkuDBU = require('../database_utilities/skuDBU.js');

let router = express.Router();

function positionIdIsValid(str) {
  const regex = /^\d{12}$/;
  return str.match(regex);
}


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

// GET /api/skus/:id
// retrieves an sku from the database given its id
router.get('/api/skus/:id', async (req,res) => {
  // create connection with the db  
  try {
    const id = parseInt(req.params.id);
    if(!Number.isInteger(id) || id < 1)
      return res.status(422).json({error: `Invalid SKU id.`});
    const db = new SkuDBU('ezwh.db');
    const skuList = await db.loadSKU(id);
    if(skuList.length === 0)
      return res.status(404).json({error: `No SKU with matching id.`});
    return res.status(200).json(skuList.pop());
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});

// POST /api/sku
// add a new sku to the database
router.post('/api/sku', async (req,res) => {
  if (req.body === undefined || req.body.description === undefined || req.body.weight === undefined || req.body.weight <= 0 || 
      req.body.volume === undefined || req.body.volume <= 0 || req.body.price === undefined || req.body.price <= 0 ||
      req.body.notes === undefined || req.body.availableQuantity === undefined || req.body.availableQuantity < 0 ||
      typeof req.body.weight !== 'number' || typeof req.body.volume !== 'number' || typeof req.body.price !== 'number' ||
      typeof req.body.availableQuantity !== 'number' || !Number.isInteger(req.body.weight) || !Number.isInteger(req.body.volume) ||
      !Number.isInteger(req.body.availableQuantity)) {
    return res.status(422).json({error: `Invalid SKU data.`});
  }
  try{
      const db = new SkuDBU('ezwh.db');
      console.log(typeof req.body.volume);
      console.log(typeof req.body.weight);
      console.log(typeof req.body.price);
      console.log(typeof req.body.availableQuantity);
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
  const id = parseInt(req.params.id);
  if (req.body === undefined || req.body.newDescription === undefined || req.body.newWeight === undefined || req.body.newWeight <= 0 || 
    req.body.newVolume === undefined || req.body.newVolume <= 0 || req.body.newPrice == undefined || req.body.newPrice <= 0 ||
    req.body.newNotes === undefined || req.body.newAvailableQuantity === undefined || req.body.newAvailableQuantity < 0 ||
    typeof req.body.weight !== 'number' || typeof req.body.volume !== 'number' || typeof req.body.price !== 'number' ||
    typeof req.body.availableQuantity !== 'number' || !Number.isInteger(req.body.weight) || !Number.isInteger(req.body.volume) ||
    !Number.isInteger(req.body.availableQuantity) || !Number.isInteger(id) || id < 1) {
    return res.status(422).json({error: `Invalid SKU data.`});
  }
  try{
      const db = new SkuDBU('ezwh.db');
      // get the sku to be modified
      const skuList = await db.loadSKU(id);
      if(skuList.length === 0)
        return res.status(404).json({error: `No SKU with matching id.`});
      const sku = skuList.pop();
      await sku.modify(db.db, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity)
      await db.updateSKU(sku);
      return res.status(200).end();
  }
  catch(err){
    if(err.code===4)
      return res.status(422).json({error: `The assigned position cannot store the SKU anymore. Update aborted.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// PUT /api/sku/:id/position
// assign a position to a sku
router.put('/api/sku/:id/position', async (req,res) => {
  const id = parseInt(req.params.id);
  if (req.body === undefined || req.body.position === undefined || !positionIdIsValid(req.body.position) ||
      !Number.isInteger(id) || id < 0) {
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
      if(skuList.length === 0)
        return res.status(404).json({error: `No SKU with matching id.`});
      const sku = skuList.pop();
      //There is a problem with setPosition
      await sku.setPosition(db.db, req.body.position);
      await db.updateSKU(sku);
      return res.status(200).end();
  }
  catch(err){
    if (err.code==4)
      return res.status(422).json({error: `Position cannot store the required SKU. Operation aborted.`});
    if (err.code==5)
      return res.status(404).json({error: `No position matches the id ${req.body.position}.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// DELETE /api/sku/:id
// remove a sku from the database
router.delete('/api/sku/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new SkuDBU('ezwh.db');
      // get the sku to be deleted
      const skuList = await db.loadSKU(id);
      if(skuList.length > 0){
        const sku = skuList.pop();
        sku.delete(db.db);
        // now, delete the sku
        await db.deleteSKU(id);
      } else return res.status(404).json({error: `No SKU with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;