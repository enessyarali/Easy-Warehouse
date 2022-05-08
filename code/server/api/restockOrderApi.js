'use strict';

const express = require('express')
const restockOrder = require('../model/restockOrder.js')
const restockOrderDBU = require('../database_utilities/restockOrderDBU.js')

let router = express.Router()

//GET  /api/restockOrdersIssued and /api/restockOrders/:id/returnItems
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


// POST /api/restockOrder
// add a new restockOrder to the database
router.post('/api/restockOrder', async (req,res) => {
  if (req.body === undefined || req.body.id === undefined|| req.body.issueDate == undefined || req.body.state === undefined ||
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



