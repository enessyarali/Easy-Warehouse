'use strict';

const express = require('express')
const ReturnOrderDBU = require('../database_utilities/returnOrderDBU.js')
const validators = require('./validation');

let router = express.Router()

//GET all return orders
router.get('/api/returnOrders', async (req,res) => {
  // create connection with the db  
  try {
    const db = new ReturnOrderDBU('ezwh.db');
    const returnOrderList = await db.loadReturnOrder()
    return res.status(200).json(returnOrderList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

//GET returnOrder by id 
router.get('/api/returnOrders/:id', async (req,res) => {
  // create connection with the db  
  try {
    const id = parseInt(req.params.id);
    if(!Number.isInteger(id) || id <= 0)
      return res.status(422).json({error: `Invalid returnOrder id.`});
    const db = new ReturnOrderDBU('ezwh.db');
    const returnOrderList = await db.loadReturnOrder(id);
    if(returnOrderList.length === 0)
      return res.status(404).json({error: `No returnOrder with matching id.`});
    return res.status(200).json(returnOrderList.pop().clean(['id']));
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});


// POST /api/returnOrder
// add a new returnOrder to the database
router.post('/api/returnOrder', async (req,res) => {
  if (req.body === undefined || req.body.returnDate == undefined || !validators.dateIsValid(req.body.returnDate)
    || req.body.products === undefined || req.body.restockOrderId === undefined 
    || req.body.products.some(p => (p.SKUId === undefined || typeof p.SKUId !== 'number' ||
    p.SKUId <= 0 || p.description === undefined || p.price === undefined ||
    typeof p.price !== 'number' || p.price <= 0 || p.RFID === undefined ||
    !validators.rfidIsValid(p.RFID)))
    || !Number.isInteger(parseInt(req.body.restockOrderId)) || parseInt(req.body.restockOrderId) <= 0) {
    return res.status(422).json({error: `Invalid returnOrder data.`});
  }
  try{
      const db = new ReturnOrderDBU('ezwh.db');
      await db.insertReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderId);
      return res.status(201).end();
  }
  catch(err){
    if (err.code==12)
      return res.status(404).json({error: 'No returnOrder with matching id.'});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// DELETE /item/returnOrder/:id
// remove a returnOrder from the database
router.delete('/api/returnOrder/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new ReturnOrderDBU('ezwh.db');
      const deleted = await db.deleteReturnOrder(id);
      if (deleted.every(d => !d))
        return res.status(404).json({error: 'No returnOrder with matching id.'});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;


