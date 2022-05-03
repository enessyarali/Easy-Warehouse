'use strict';

const express = require('express')
const restockOrder = require('../model/restockOrder.js')
const restockOrderDBU = require('../database_utilities/restockOrderDBU.js')

let router = express.Router()

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



