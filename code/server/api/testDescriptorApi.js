'use strict';

const express = require('express');
const TestDescriptorDBU = require('../database_utilities/testDescriptorDBU.js');

let router = express.Router();

// GET /api/testDescriptors
// retrieves all test descriptors from the database
router.get('/api/testDescriptors', async (req,res) => {
    try {
      const db = new TestDescriptorDBU('ezwh.db');
      const descriptorList = await db.loadTestDescriptor();
      return res.status(200).json(descriptorList);
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// GET /api/testDescriptors/:id
// retrieves a test descriptor from the database given its id
router.get('/api/testDescriptors/:id', async (req,res) => {
    const id = parseInt(req.params.id);
    if(!Number.isInteger(id) || id < 1 ) {
        return res.status(422).json({error: `Invalid test descriptor id.`});
    }
    try {
      const db = new TestDescriptorDBU('ezwh.db');
      const descriptorList = await db.loadTestDescriptor(id);
      if(descriptorList.length === 0)
        return res.status(404).json({error: `No test descriptor with matching id.`});
    return res.status(200).json(descriptorList[0]);
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/testDescriptor
// add a new test descriptor to the database
router.post('/api/testDescriptor', async (req,res) => {
  if (req.body === undefined || !req.body.name || !req.body.procedureDescription ||
      req.body.idSKU === undefined || !Number.isInteger(parseInt(req.body.idSKU)) || parseInt(req.body.idSKU) < 1 ) {
    return res.status(422).json({error: `Invalid test descriptor data.`});
  }
  try{
      const db = new TestDescriptorDBU('ezwh.db');
      await db.insertTestDescriptor(req.body.name, req.body.procedureDescription, req.body.idSKU);
      return res.status(201).end();
  }
  catch(err){
    if (err.code === 3)
      return res.status(404).json({error: `No SKU with matching id.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// PUT /api/testDescriptor/:id
// modify a test descriptor in the database
router.put('/api/testDescriptor/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (req.body === undefined || (req.body.newName === undefined && req.body.newProcedureDescription === undefined &&
      req.body.newIdSKU === undefined) || (req.body.newName !== undefined && !req.body.newName) ||
      (req.body.newProcedureDescription !== undefined && !req.body.newProcedureDescription) ||
      (req.body.newIdSKU !== undefined && (!Number.isInteger(parseInt(req.body.newIdSKU)) ||
      parseInt(req.body.newIdSKU) < 1)) || id === undefined || !Number.isInteger(id) || id < 1 ) {
    return res.status(422).json({error: `Invalid test descriptor data.`});
  }
  try{
    const db = new TestDescriptorDBU('ezwh.db');
    const descriptorList = await db.loadTestDescriptor(id);
    const descriptor = descriptorList.pop();
  
    const name = req.body.newName ? req.body.newName : descriptor.name;
    const procedure = req.body.newProcedureDescription ? req.body.newProcedureDescription : descriptor.procedureDescription;
    const idSKU = req.body.newIdSKU ? req.body.newIdSKU : descriptor.idSKU;

    const isUpdated = await db.updateTestDescriptor(id, name, procedure, idSKU);
    if (!isUpdated)
      return res.status(404).json({error: `No test descriptor with matching id.`});
    return res.status(200).end();
  }
  catch(err){
    if (err.code === 3)
      return res.status(404).json({error: `No SKU with matching id.`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// DELETE /api/testDescriptor/:id
// remove a test descriptor from the database
router.delete('/api/testDescriptor/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (id === undefined || !Number.isInteger(id) || id < 1 ) {
    return res.status(422).json({error: `Invalid id.`});
  }
  try{
      const db = new TestDescriptorDBU('ezwh.db');
      const deleted = await db.deleteTestDescriptor(id);
      if (!deleted)
        return res.status(404).json({error: `No test descriptor with matching id.`});
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;