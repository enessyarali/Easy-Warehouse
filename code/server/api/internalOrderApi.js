'use strict';

const express = require('express')
const internalOrder = require('../model/internalOrder.js')
const internalOrderDBU = require('../database_utilities/internalOrderDBU.js')

let router = express.Router()

router.get('/api/items', async (req,res) => {
  // create connection with the db  
  try {
    const db = new internalOrderDBU('ezwh.db');
    const internalOrderList = await db.loadinternalOrder()
    return res.status(200).json(internalOrderList);
  } catch (err) {
      return res.status(500).json({message: `Something went wrong...`, error: err});
  }
});



