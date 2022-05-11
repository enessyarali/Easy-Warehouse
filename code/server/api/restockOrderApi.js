'use strict';

const express = require('express')
const restockOrder = require('../model/restockOrder.js')
const restockOrderDBU = require('../database_utilities/restockOrderDBU.js')

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

function dateIsValid(dateStr) {
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  const regex2 = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;

  if (!dateStr.match(regex) && !dateStr.match(regex2)) {
    return false;
  }

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

  return true;
}

//GET  and /api/restockOrders/:id/returnItems
//Needs to be added SUPPORT NEEDED
router.get('/api/restockOrders', async (req,res) => {
  // create connection with the db  
  try {
    const db = new restockOrderDBU('ezwh.db');
    const restockOrderList = await db.loadrestockOrder()
    return res.status(200).json(restockOrderList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

router.get('/api/restockOrders/:id', async (req,res) => {
  // create connection with the db  
  try {
    const id = req.params.id;
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid restockOrder id.`});
    const db = new restockOrderDBU('ezwh.db');
    const restockOrderList = await db.loadrestockOrder(id);
    if(restockOrderList.length === 0)
      return res.status(404).json({error: `No restockOrder with matching id.`});
    return res.status(200).json(restockOrderList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});
// /api/restockOrdersIssued 
router.get('/api/restockOrders/:id', async (req,res) => {
  // create connection with the db  
  try {
    const state = req.params.id;
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid restockOrder id.`});
    const db = new restockOrderDBU('ezwh.db');
    const restockOrderList = await db.loadrestockOrder(state);
    if(restockOrderList.state != 'ISSUED')
      return res.status(404).json({error: `Restock Order state is not issued`});
    return res.status(200).json(restockOrderList.state === 'ISSUED');
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});


///api/restockOrders/:id/returnItems //ONGOING FIXES   
{ /*
router.get('/api/restockOrders/:id/returnItems', async (req,res) => {
  // create connection with the db  
  try {
    const id = req.params.id;
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid restockOrder id.`});
    const db = new restockOrderDBU('ezwh.db');
    const restockOrderList = await db.loadrestockOrder(id);
    if(restockOrderList.skuitems === 0)
      return res.status(404).json({error: `No restockOrder with matching id.`});
    return res.status(200).json(restockOrderList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
}); */}

// POST /api/restockOrder
// add a new restockOrder to the database
router.post('/api/restockOrder', async (req,res) => {
  if (req.body === undefined || req.body.id === undefined|| dateIsValid(req.body.issueDate) ||req.body.issueDate == undefined || req.body.state === undefined ||
      req.body.products === undefined || req.body.supplierId || req.body.transportnote || req.body.skuitems === undefined) {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new restockOrderDBU('ezwh.db');
      await db.insertrestockOrder(req.body.id, req.body.issueDate, req.body.state = 'ISSUED' ,req.body.products,req.body.supplierId,
      req.body.transportnote,req.body.skuitems= [] );
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

//PUT PART NEEDS SUPPORT
// /api/restockOrder/:id/skuItems  /api/restockOrder/:id/transportNote

// PUT /api/restockOrder/:id
router.put('/api/restockOrder/:id', async (req,res) => {
  const id = req.params.id;
  if (req.body === undefined || req.body.newState) {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new restockOrderDBU('ezwh.db');
      // get the restockOrder to be modified
      const restockOrderList = await db.loadrestockOrder(id);
      const restockOrder = restockOrderList.pop();
      if(restockOrderList.length === 0)
        return res.status(404).json({error: `No restockOrder with matching id.`});
      restockOrder.modify(db.db, req.body.newState)
      await db.updaterestockOrder(restockOrder);
      return res.status(201).end();
  }
  catch(err){
    if(err.code===4)
      return res.status(422).json({error: `The assigned state cannot be used by the restockOrder anymore. Update aborted.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// PUT /api/restockOrder/:skuItems 
router.put('/api/restockOrder/:skuItems', async (req,res) => {
  const id = req.params.id;
  if (req.body === undefined || req.body.skuitems) {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new restockOrderDBU('ezwh.db');
      // get the restockOrder to be modified
      const restockOrderList = await db.loadrestockOrder(id);
      const restockOrder = restockOrderList.pop();
      if(restockOrderList.length === 0)
        return res.status(404).json({error: `No restockOrder with matching id.`});
      restockOrder.modify(db.db, req.body.skuitems)
      await db.updaterestockOrder(restockOrder);
      return res.status(201).end();
  }
  catch(err){
    if(err.code===4)
      return res.status(422).json({error: `The assigned skuItem cannot be used by the restockOrder anymore. Update aborted.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// PUT /api/restockOrder/:transportnote
router.put('/api/restockOrder/:id/transportNote', async (req,res) => {
  const id = req.params.id;
  const issueDate = req.params.issueDate;
  if (req.body === undefined || req.body.transportnote === undefined || getState(req.body.state) != 'DELIVERY') {
    return res.status(422).json({error: `Invalid restockOrder data.`});
  }
  try{
      const db = new restockOrderDBU('ezwh.db');
      // get the restockOrder to be modified
      const restockOrderList = await db.loadrestockOrder(id);
      const restockOrder = restockOrderList.pop();
      if(restockOrderList.transportnote['deliveryDate'] < issueDate)
        return res.status(404).json({error: `Delivery Date Before Issue Date.`});
      restockOrder.modify(db.db, req.body.transportnote)
      await db.updaterestockOrder(restockOrder);
      return res.status(201).end();
  }
  catch(err){
    if(err.code===4)
      return res.status(422).json({error: `The assigned transportnote cannot be used by the restockOrder anymore. Update aborted.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// DELETE /restockOrder/restockOrder/:id
// remove a restockOrder from the database
router.delete('/api/restockOrder/:id', async (req,res) => {
  const id = req.params.id;
  if (!Number.isInteger(id) || id < 0) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new restockOrderDBU('ezwh.db');
      // get the restockOrder to be deleted
      const restockOrderList = await db.loadrestockOrder(id);
      if(restockOrderList.length > 0){
        const restockOrderList = restockOrderList.pop();
        restockOrderList.delete(db.db);
        // now, delete the restockOrder
        await db.deleterestockOrder(id);
      } else return res.status(404).json({error: `No restockOrder with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;



