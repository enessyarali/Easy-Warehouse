'use strict';

const express = require('express')
const returnOrder = require('../model/returnOrder.js')
const returnOrderDBU = require('../database_utilities/returnOrderDBU.js')

let router = express.Router()

//GET all return orders
router.get('/api/returnOrders', async (req,res) => {
  // create connection with the db  
  try {
    const db = new returnOrderDBU('ezwh.db');
    const returnOrderList = await db.loadreturnOrder()
    return res.status(200).json(returnOrderList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

//GET returnOrder by id 
router.get('/api/returnOrders/:id', async (req,res) => {
  // create connection with the db  
  try {
    const id = req.params.id;
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid returnOrder id.`});
    const db = new internalOrderDBU('ezwh.db');
    const returnOrderList = await db.loadreturnOrder(id);
    if(returnOrderList.length === 0)
      return res.status(404).json({error: `No returnOrder with matching id.`});
    return res.status(200).json(returnOrderList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});


// POST /api/returnOrder
// add a new returnOrder to the database
router.post('/api/returnOrder', async (req,res) => {
  if (req.body === undefined || req.body.id === undefined|| req.body.retrunDate == undefined || req.body.products === undefined ||
      req.body.restockOrderId === undefined ) {
    return res.status(422).json({error: `Invalid returnkOrder data.`});
  }
  try{
      const db = new returnOrderDBU('ezwh.db');
      await db.insertreturnOrder(req.body.id, req.body.returnDate, req.body.products ,req.body.restockOrderId);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// DELETE /item/returnOrder/:id
// remove a returnOrder from the database
router.delete('/api/returnOrder/:id', async (req,res) => {
  const id = req.params.id;
  if (!Number.isInteger(id) || id < 0) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new returnOrderDBU('ezwh.db');
      // get the item to be deleted
      const returnOrderList = await db.loadreturnOrder(id);
      if(ItemList.length > 0){
       returnOrderList = returnOrderList.pop();
        returnOrderList.delete(db.db);
        // now, delete the returnOrder
        await db.deletereturnOrder(id);
      } else return res.status(404).json({error: `No returnOrder with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;


