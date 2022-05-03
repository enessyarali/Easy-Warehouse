'use strict';

const express = require('express')
const returnOrder = require('../model/returnOrder.js')
const returnOrderDBU = require('../database_utilities/returnOrderDBU.js')

let router = express.Router()

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



