'use strict';

const express = require('express')
const RestockOrder = require('../model/restockOrder.js')
const RestockOrderDBU = require('../database_utilities/restockOrderDBU.js')

let router = express.Router()


function getState(str) {
  const clean = str.trim().toUpperCase();
  switch (clean) {
    case "ISSUED":
    case "ACCEPTED":
    case "REFUSED":
    case "CANCELED":
    case "COMPLETED":
      return clean;
    default:
      return undefined;
  }
}

function dateIsValid(dateStr, compare=true) {
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  const regex2 = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;

  if (!dateStr.match(regex) && !dateStr.match(regex2)) {
    return false;
  }

  if (compare) {
    const now = new Date();
    if(dateStr.match(regex2)){
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
  }

  return true;
}

async function checkState(db, orderId, stateRequested) {
  try{
    const currentState = await db.retriveState(orderId);
    return currentState == stateRequested;
  }
  catch {
    return false;
  }
}

//GET /api/restockOrders
router.get('/api/restockOrders', async (req,res) => {
  // create connection with the db  
  try {
    const db = new RestockOrderDBU('ezwh.db');
    const restockOrderList = await db.loadRestockOrder();
    return res.status(200).json(restockOrderList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

//GET /api/restockOrdersIssued
router.get('/api/restockOrdersIssued', async (req,res) => {
  // create connection with the db  
  try {
    const db = new RestockOrderDBU('ezwh.db');
    const restockOrderList = await db.loadRestockOrder(null, 'ISSUED');
    return res.status(200).json(restockOrderList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

//GET /api/restockOrdersIssued/:id
router.get('/api/restockOrders/:id', async (req,res) => {
  // create connection with the db  
  try {
    const id = parseInt(req.params.id);
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid restockOrder id.`});
    const db = new RestockOrderDBU('ezwh.db');
    const restockOrderList = await db.loadRestockOrder(id);
    if(restockOrderList.length === 0)
      return res.status(404).json({error: `No restockOrder with matching id.`});
    return res.status(200).json(restockOrderList.pop());
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});

// GET /api/restockOrders/:id/returnItems
router.get('/api/restockOrders/:id/returnItems', async (req,res) => {
  // create connection with the db  
  try {
    const id = parseInt(req.params.id);
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid restockOrder id.`});
    const db = new RestockOrderDBU('ezwh.db');

    const isRightState = await checkState(db, id, 'COMPLETEDRETURN');
    if(!isRightState) {
      return res.status(422).json({error: 'Order status is not COMPLETEDRETURN.'});
    }

    const returnItems = await db.selectReturnItems(id);
    return res.status(200).json(returnItems);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
}); 

// POST /api/restockOrder
// add a new restockOrder to the database
router.post('/api/restockOrder', async (req,res) => {
  if (req.body === undefined || req.body.issueDate == undefined || !dateIsValid(req.body.issueDate) || 
      req.body.products === undefined || req.body.supplierId === undefined) {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new RestockOrderDBU('ezwh.db');
      await db.insertRestockOrder(req.body.issueDate, req.body.products, req.body.supplierId);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/restockOrder/:id
router.put('/api/restockOrder/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if(!Number.isInteger(id) || id < 0)
    return res.status(422).json({error: `Invalid restockOrder id.`});
  if (req.body === undefined || getState(req.body.newState) === undefined) {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new RestockOrderDBU('ezwh.db');
      // get the restockOrder to be modified
      const updated = await db.patchRestockOrderState(id, getState(req.body.newState));
      if(!updated)
        return res.status(404).json({error: `No restockOrder with matching id.`});
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/restockOrder/:id/skuItems 
router.put('/api/restockOrder/:id/skuItems', async (req,res) => {
  const id = parseInt(req.params.id);
  if(!Number.isInteger(id) || id < 0)
    return res.status(422).json({error: `Invalid restockOrder id.`});
  if (req.body === undefined || req.body.skuItems === undefined || req.body.skuItems.some((i) => (i.SKUId===undefined || i.rfid===undefined))) {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new RestockOrderDBU('ezwh.db');

      const isRightState = await checkState(db, id, 'DELIVERED');
      if(!isRightState) {
        return res.status(422).json({error: 'Order status is not DELIVERED.'});
      }

      await db.patchRestockOrderSkuItems(id, req.body.skuItems);
      return res.status(201).end();
  }
  catch(err){
    if (err.code==12)
      return res.status(404).json({error: `No restockOrder with matching id.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/restockOrder/:id/transportnote
router.put('/api/restockOrder/:id/transportNote', async (req,res) => {
  const id = parseInt(req.params.id);
  if(!Number.isInteger(id) || id < 0)
    return res.status(422).json({error: `Invalid restockOrder id.`});
  if (req.body === undefined || req.body.transportNote === undefined || req.body.transportNote.deliveryDate === undefined) {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new RestockOrderDBU('ezwh.db');
      // get the restockOrder to be modified
      const restockOrderList = await db.loadRestockOrder(id);
      if (restockOrderList.length==0)
        return res.status(404).json({error: `No restockOrder with matching id.`});
      if(restockOrderList.pop().transportNote.deliveryDate < issueDate)
        return res.status(422).json({error: `Delivery Date Before Issue Date.`});

      const isRightState = await checkState(db, id, 'DELIVERY');
      if(!isRightState) {
        return res.status(422).json({error: 'Order status is not DELIVERY.'});
      }
      
      await db.patchRestockOrderTransportNote(id, req.body.transportNote);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// DELETE /restockOrder/restockOrder/:id
// remove a restockOrder from the database
router.delete('/api/restockOrder/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id < 0) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new RestockOrderDBU('ezwh.db');
      // delete the restockOrder
      const deleted = sum(await db.deleterestockOrder(id));
      if (!deleted)
        return res.status(404).json({error: `No restockOrder with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;



