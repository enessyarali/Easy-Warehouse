'use strict';

const express = require('express');
const SkuItemDBU = require('../database_utilities/skuItemDBU.js');

let router = express.Router();

function dateIsValid(dateStr) {
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    const regex2 = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;
  
    if (!regex.test(dateStr) && !regex2.test(dateStr)) {
      return false;
    }

    const now = new Date();
    if(regex2.test(dateStr)){
        const [date, time] = dateStr.split(' ');
        const [year, month, day] = date.split('/');
        const [hour, minute] = time.split(':');
        const myDate = new Date(year, month - 1, day, hour, minute);
        if(!(myDate instanceof Date))
            return false;
        if(myDate.getTime() > now.getTime())
            return false;
    }
    else{
        const [year, month, day] = dateStr.split('/');
        const myDate = new Date(year, month - 1, day);
        if(!(myDate instanceof Date))
            return false;
        if(myDate.getTime() > now.getTime())
            return false;
    }

    return true;
  }

function rfidIsValid(str){
  const regex = /^\d{32}$/;
  return regex.test(str);
}

// GET /api/skuitems
// retrieves all sku items from the database
router.get('/api/skuitems', async (req,res) => {
  try {
    const db = new SkuItemDBU('ezwh.db');
    const skuItemList = await db.loadSKUitem();
    return res.status(200).json(skuItemList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});

// GET /api/skuitems/sku/:id
// retrieves all available sku items from the database given the sku id
router.get('/api/skuitems/sku/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  try {
    if(!Number.isInteger(id) || id <= 0)
      return res.status(422).json({error: `Invalid SKU id`});
    const db = new SkuItemDBU('ezwh.db');
    const skuItemList = await db.loadSKUitem(null, id);
    return res.status(200).json(skuItemList);
  } catch (err) {
      if (err.code == 3)
        return res.status(404).json({error: `Provided id [${id}] does not match any SKU`});
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});

// GET /api/skuitems/:rfid
// retrieves a sku item from the database given its rfid
router.get('/api/skuitems/:rfid', async (req,res) => {
    try {
      const rfid = req.params.rfid;
      if(!rfidIsValid(rfid))
        return res.status(422).json({error: `Invalid SKU item rfid.`});
      const db = new SkuItemDBU('ezwh.db');
      const skuItemList = await db.loadSKUitem(rfid);
      if(skuItemList.length === 0)
        return res.status(404).json({error: `No SKU item with matching rfid.`});
      return res.status(200).json(skuItemList.pop());
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/skuitem
// add a new sku item to the database
router.post('/api/skuitem', async (req,res) => {
  if (req.body === undefined || req.body.RFID === undefined || typeof(req.body.RFID) !== 'string' || !rfidIsValid(req.body.rfid) ||
      req.body.SKUId === undefined || !Number.isInteger(parseInt(req.body.SKUId)) || parseInt(req.body.SKUId) <= 0 ||
      (req.body.DateOfStock !== undefined && !dateIsValid(req.body.DateOfStock)) ) {
    return res.status(422).json({error: `Invalid SKU Item data.`});
  }
  try{
      const db = new SkuItemDBU('ezwh.db');
      const skuItemList = await db.loadSKUitem(req.body.RFID);
      if(skuItemList.length > 0)
        return res.status(422).json({error: `SKU item already in database.`});
      if(req.body.DateOfStock !== undefined)
        await db.insertSKUitem(req.body.RFID, req.body.SKUId, req.body.DateOfStock);
      else
        await db.insertSKUitem(req.body.RFID, req.body.SKUId);
      return res.status(201).end();
  }
  catch(err){
    if (err.code == 3)
        return res.status(404).json({error: `Provided id [${req.body.SKUId}] does not match any SKU`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/skuitems/:rfid
// modify a sku item in the database
router.put('/api/skuitems/:rfid', async (req,res) => {
  const rfid = req.params.rfid;
  if (!rfidIsValid(rfid) || req.body === undefined || req.body.newRFID === undefined || !rfidIsValid(req.body.newRFID) ||
  req.body.newAvailable === undefined || !Number.isInteger(parseInt(req.body.newAvailable)) || parseInt(req.body.newAvailable) < 1 ||
  (req.body.newDateOfStock !== undefined && !dateIsValid(req.body.newDateOfStock)) ) {
    return res.status(422).json({error: `Invalid SKU item data.`});
  }
  try{
      const db = new SkuItemDBU('ezwh.db');
      const updated = await db.updateSKUitem(rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
      if (updated === 0)
        return res.status(404).json({error: `No SKU item with matching rfid.`});
      return res.status(200).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// DELETE /api/skuitems/:rfid
// remove a sku item from the database
router.delete('/api/skuitems/:rfid', async (req,res) => {
  const rfid = req.params.rfid;
  if (!rfidIsValid(rfid)) {
    return res.status(422).json({error: `Validation of rfid failed`});
  }
  try{
      const db = new SkuItemDBU('ezwh.db');
      await db.deleteSKUitem(rfid);
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;

/* THE COMPLEX VERSION OF PUT IS NOT NEEDED RIGHT NOW... KEEPING IT FOR THE FUTURE (it may be useful)
// PUT /api/skuitems/:rfid
// modify a sku item in the database
router.put('/api/skuitems/:rfid', async (req,res) => {
  const rfid = req.params.rfid;
  if (req.body === undefined || req.body.newRFID === undefined || typeof(req.body.newRFID) !== 'string' ||
  req.body.newAvailable === undefined || !Number.isInteger(parseInt(req.body.newAvailable)) || parseInt(req.body.newAvailable) < 0 ||
  (req.body.newDateOfStock !== undefined && !dateIsValid(req.body.newDateOfStock)) ) {
    return res.status(422).json({error: `Invalid SKU item data.`});
  }
  try{
      const db = new SkuItemDBU('ezwh.db');
      // get the sku item to be modified
      const skuItemList = await db.loadSKUitem(rfid);
      if(skuItemList.length === 0)
        return res.status(404).json({error: `No SKU item with matching rfid.`});
      const skuItem = skuItemList.pop();
      if(req.body.newDateOfStock !== undefined)
        skuItem.modify(db.db, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
      else
        skuItem.modify(db.db, req.body.newRFID, req.body.newAvailable);
      await db.updateSKUItem(skuItem);
      return res.status(200).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
}); */