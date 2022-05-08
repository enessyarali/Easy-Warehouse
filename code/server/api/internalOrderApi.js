'use strict';

const express = require('express')
const internalOrder = require('../model/internalOrder.js')
const internalOrderDBU = require('../database_utilities/internalOrderDBU.js')

let router = express.Router()

//GET PART NEEDS SUPPORT
// /api/internalOrdersIssued  /api/internalOrdersAccepted

router.get('/api/internalOrders', async (req,res) => {
  // create connection with the db  
  try {
    const db = new internalOrderDBU('ezwh.db');
    const internalOrderList = await db.loadinternalOrder()
    return res.status(200).json(internalOrderList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

router.get('/api/internalOrders/:id', async (req,res) => {
  // create connection with the db  
  try {
    const id = req.params.id;
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid internalOrder id.`});
    const db = new internalOrderDBU('ezwh.db');
    const internalOrderList = await db.loadinternalOrder(id);
    if(internalOrderList.length === 0)
      return res.status(404).json({error: `No internalOrder with matching id.`});
    return res.status(200).json(internalOrderList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});


// POST /api/internalOrder
// add a new internalOrder to the database
router.post('/api/internalOrder', async (req,res) => {
  if (req.body === undefined || req.body.id === undefined|| req.body.issueDate == undefined || req.body.state === undefined ||
      req.body.products === undefined || req.body.customerId === undefined) {
    return res.status(422).json({error: `Invalid internalOrder data.`});
  }
  try{
      const db = new internalOrderDBU('ezwh.db');
      await db.insertinternalOrder(req.body.id, req.body.issueDate, req.body.state = 'ISSUED' ,req.body.products,req.body.customerId);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

//PUT PART NEEDS SUPPORT
// PUT /api/internalOrder/:id
// Modify the state of an internal order, given its id. If newState is = COMPLETED an array of RFIDs is sent
router.put('/api/item/:id', async (req,res) => {
  const id = req.params.id;
  if (req.body === undefined || req.body.id === undefined || req.body.issueDate == undefined || req.body.state ===undefined||
     req.body.customerId ===undefined ||  req.body.products===undefined) {
    return res.status(422).json({error: `Invalid item data.`});
  }
  try{
      const db = new internalOrderDBU('ezwh.db');
      // get the item to be modified
      const internalOrderList = await db.loadinternalOrder(id);
      const internalOrder = internalOrderList.pop();
      if(itemList.length === 0)
        return res.status(404).json({error: `No item with matching id.`});
      internalOrder.modify(db.db, req.body.id,req.body.issueDate, req.body.newAvailableQuantity)
      await db.updateItem(item);
      return res.status(200).end();
  }
  catch(err){
    if(err.code===4)
      return res.status(422).json({error: `The assigned internalOrder cannot be modified. Update aborted.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// DELETE /item/internalOrder/:id
// remove a internalOrder from the database
router.delete('/api/internalOrder/:id', async (req,res) => {
  const id = req.params.id;
  if (!Number.isInteger(id) || id < 0) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new internalOrderDBU('ezwh.db');
      // get the item to be deleted
      const internalOrderList = await db.loadinternalOrder(id);
      if(ItemList.length > 0){
        const internalOrderList = internalOrderList.pop();
        internalOrderList.delete(db.db);
        // now, delete the internalOrder
        await db.deleteinternalOrder(id);
      } else return res.status(404).json({error: `No internalOrder with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;


