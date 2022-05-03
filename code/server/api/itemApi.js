'use strict';

const express = require('express')
const Item = require('../model/item.js')
const ItemDBU = require('../database_utilities/itemDBU.js')

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



