'use strict';

const express = require('express')
const Item = require('../model/item.js')
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
    const id = req.params.id;
    if(!Number.isInteger(id) || id < 0)
      return res.status(422).json({error: `Invalid Item id.`});
    const db = new ItemDBU('ezwh.db');
    const ItemList = await db.loadItem(id);
    if(ItemList.length === 0)
      return res.status(404).json({error: `No Item with matching id.`});
    return res.status(200).json(itemList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});


// POST /api/item
// add a new item to the database
router.post('/api/item', async (req,res) => {
  if (req.body === undefined || req.body.description === undefined|| req.body.price == undefined || req.body.price > 0 ||
      req.body.skuId === undefined || req.body.supplierId === undefined) {
    return res.status(422).json({error: `Invalid item data.`});
  }
  try{
      const db = new ItemDBU('ezwh.db');
      await db.insertItem(req.body.description, req.body.price, req.body.skuId,req.body.supplierId);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/item/:id
// modify an item in the database
router.put('/api/item/:id', async (req,res) => {
  const id = req.params.id;
  if (req.body === undefined || req.body.newDescription === undefined || req.body.newPrice == undefined || req.body.newPrice > 0) {
    return res.status(422).json({error: `Invalid item data.`});
  }
  try{
      const db = new ItemDBU('ezwh.db');
      // get the item to be modified
      const itemList = await db.loadItem(id);
      const item = itemList.pop();
      if(itemList.length === 0)
        return res.status(404).json({error: `No item with matching id.`});
      item.modify(db.db, req.body.newDescription,req.body.newPrice)
      await db.updateItem(item);
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
router.delete('/api/item/:id', async (req,res) => {
  const id = req.params.id;
  if (!Number.isInteger(id) || id < 0) {
    return res.status(422).json({error: `Validation of id failed`});
  }
  try{
      const db = new ItemDBU('ezwh.db');
      // get the item to be deleted
      const ItemList = await db.loadItem(id);
      if(ItemList.length > 0){
        const item = ItemList.pop();
        item.delete(db.db);
        // now, delete the item
        await db.deleteItem(id);
      } else return res.status(404).json({error: `No Item with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;