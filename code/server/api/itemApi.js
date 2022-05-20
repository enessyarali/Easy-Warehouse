'use strict';

const express = require('express')
const ItemDBU = require('../database_utilities/ItemDBU.js')

let router = express.Router()

router.get('/api/items', async (req,res) => {
  // create connection with the db  
  try {
    const db = new ItemDBU('ezwh.db');
    const ItemList = await db.loadItem()
    return res.status(200).json(ItemList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});

router.get('/api/items/:id', async (req,res) => {
  // create connection with the db  
  try {
    const id = parseInt(req.params.id);
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid Item id.`});
    const db = new ItemDBU('ezwh.db');
    const itemList = await db.loadItem(id);
    if(itemList.length === 0)
      return res.status(404).json({error: `No Item with matching id.`});
    return res.status(200).json(itemList.pop());
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});


// POST /api/item
// add a new item to the database
router.post('/api/item', async (req,res) => {
  if (req.body === undefined || req.body.description === undefined|| 
      req.body.price == undefined || req.body.price <= 0 || typeof req.body.price !== 'number' ||
      req.body.SKUId === undefined || req.body.SKUId <= 0 || typeof req.body.SKUId !== 'number' ||
      req.body.id == undefined || req.body.id == undefined || typeof req.body.id !== 'number' ||
      !Number.isInteger(req.body.id) || req.body.supplierId === undefined ||
      req.body.supplierId <= 0 || typeof req.body.id !== 'number') {
    return res.status(422).json({error: `Invalid item data.`});
  }
  try{
      const db = new ItemDBU('ezwh.db');
      await db.insertItem(req.body.id, req.body.description, req.body.price, req.body.SKUId, req.body.supplierId);
      return res.status(201).end();
  }
  catch(err){
    if (err.code==6)
      return res.status(404).json({error: "Supplier not found. Operation aborted."});
    if (err.code==3)
      return res.status(404).json({error: "SKU not found. Operation aborted."});
    if (err.code==8)
      return res.status(422).json({error: "Supplier already sells SKU / Item. Operation aborted."});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/item/:id
// modify an item in the database
router.put('/api/item/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (req.body === undefined || req.body.newDescription === undefined || 
    req.body.newPrice == undefined || req.body.newPrice < 0 || typeof req.body.newPrice !== 'number') {
    return res.status(422).json({error: `Invalid item data.`});
  }
  try{
      const db = new ItemDBU('ezwh.db');
      // get the item to be modified
      const updated = await db.updateItem(id, req.body.newDescription, req.body.newPrice);
      if(!updated)
        return res.status(404).json({error: `No item with matching id.`});
      return res.status(200).end();
  }
  catch(err){
    if(err.code===4)
      return res.status(422).json({error: `The assigned position cannot store the item anymore. Update aborted.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// DELETE /api/item/:id
// remove a item from the database
router.delete('/api/items/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id < 0) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new ItemDBU('ezwh.db');
      const deleted = await db.deleteItem(id);
      if (!deleted)
        return res.status(404).json({error: `No Item with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;