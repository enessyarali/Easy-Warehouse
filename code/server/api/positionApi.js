'use strict';

const express = require('express');
const PositionDBU = require('../database_utilities/positionDBU.js');
const validators = require('./validation');

let router = express.Router();

// GET /api/positions
// retrieves all positions from the database
router.get('/api/positions', async (req,res) => {
  try {
    const db = new PositionDBU('ezwh.db');
    const positionList = await db.loadPosition();
    return res.status(200).json(positionList);
  } catch (err) {
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
  }
});

// POST /api/position
// add a new position to the database
router.post('/api/position', async (req,res) => {
  if (req.body === undefined || req.body.positionID === undefined || req.body.aisleID === undefined ||
      req.body.row === undefined || req.body.col === undefined || !validators.posFieldIsValid(req.body.aisleID) || !validators.posFieldIsValid(req.body.row) ||
      !validators.posFieldIsValid(req.body.col) || req.body.positionID !== req.body.aisleID + req.body.row + req.body.col ||
      req.body.maxWeight === undefined || !Number.isInteger(parseInt(req.body.maxWeight)) || parseInt(req.body.maxWeight) <= 0 ||
      req.body.maxVolume === undefined || !Number.isInteger(parseInt(req.body.maxVolume)) || parseInt(req.body.maxVolume) <= 0 ) {
    return res.status(422).json({error: `Invalid position data.`});
  }
  try{
      const db = new PositionDBU('ezwh.db');
      await db.insertPosition(req.body.positionID, req.body.aisleID, req.body.row, req.body.col, req.body.maxWeight, req.body.maxVolume);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});


// PUT /api/position/:positionID
// modify a position in the database
router.put('/api/position/:positionID', async (req,res) => {
  const positionID = req.params.positionID;
  if (!validators.rfidIsValid(positionID) || req.body === undefined || req.body.newAisleID === undefined || req.body.newRow === undefined ||
      req.body.newCol === undefined || !validators.posFieldIsValid(req.body.newAisleID) || !validators.posFieldIsValid(req.body.newRow) || !validators.posFieldIsValid(req.body.newCol) ||
      req.body.newMaxWeight === undefined || !Number.isInteger(parseInt(req.body.newMaxWeight)) || parseInt(req.body.newMaxWeight) <= 0 ||
      req.body.newMaxVolume === undefined || !Number.isInteger(parseInt(req.body.newMaxVolume)) || parseInt(req.body.newMaxVolume) <= 0 ||
      req.body.newOccupiedWeight === undefined || !Number.isInteger(parseInt(req.body.newOccupiedWeight)) || parseInt(req.body.newOccupiedWeight) < 0 ||
      req.body.newOccupiedVolume === undefined || !Number.isInteger(parseInt(req.body.newOccupiedVolume)) || parseInt(req.body.newOccupiedVolume) < 0 ||
      parseInt(req.body.newOccupiedWeight) > parseInt(req.body.newMaxWeight) || parseInt(req.body.newOccupiedVolume) > parseInt(req.body.newMaxVolume)) {
    return res.status(422).json({error: `Invalid position data.`});
  }
  try{
      const db = new PositionDBU('ezwh.db');
      const updated = await db.updatePosition(positionID, null, null, req.body.newAisleID, req.body.newRow, req.body.newCol, req.body.newMaxWeight, req.body.newMaxVolume, req.body.newOccupiedWeight, req.body.newOccupiedVolume);
      if(updated === 0)
          return res.status(404).json({error: `No position with matching id.`});
      return res.status(200).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// PUT /api/position/:positionID/changeID
// modify the id of a position in the database
router.put('/api/position/:positionID/changeID', async (req,res) => {
    const positionID = req.params.positionID;
    if (!validators.rfidIsValid(positionID) || req.body === undefined || req.body.newPositionID === undefined || !validators.rfidIsValid(req.body.newPositionID) ) {
      return res.status(422).json({error: `Invalid position id.`});
    }
    try{
      const db = new PositionDBU('ezwh.db');
      const updated = await db.updatePosition(positionID, null, req.body.newPositionID);
      if(updated === 0)
          return res.status(404).json({error: `No position with matching id.`});
      return res.status(200).end();
    }
    catch(err){
      return res.status(503).json({error: `Something went wrong...`, message: err.message});
    }
  });

// DELETE /api/position/:positionID
// remove a position from the database
router.delete('/api/position/:positionID', async (req,res) => {
  const positionID = req.params.positionID;
  if (!validators.rfidIsValid(positionID)) {
    return res.status(422).json({error: `Invalid position id.`});
  }
  try{
      const db = new PositionDBU('ezwh.db');
      // get the position to be deleted
      const deleted = await db.deletePosition(positionID);
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;