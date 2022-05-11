'use strict';

const express = require('express');
const TestDescriptorDBU = require('../database_utilities/testDescriptorDBU.js');
const SkuDBU = require('../database_utilities/skuDBU.js');

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
    if(!Number.isInteger(id) || id < 0 ) {
        res.status(422).json({error: `Invalid test descriptor id.`});
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
  if (req.body === undefined || req.body.name === undefined || req.body.procedureDescription === undefined ||
      req.body.idSKU === undefined || !Number.isInteger(parseInt(req.body.idSKU)) || parseInt(req.body.idSKU) < 0 ) {
    return res.status(422).json({error: `Invalid test descriptor data.`});
  }
  try{
      const db = new TestDescriptorDBU('ezwh.db');
      const dbSKU = new SkuDBU('ezwh.db');
      const skuList = await dbSKU.loadSKU(req.body.idSKU);
      if(skuList.length === 0)
        return res.status(404).json({error: `No sku with matching idSKU`, message: err.message});
      await db.insertTestDescriptor(req.body);
      return res.status(201).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// PUT /api/testDescriptor/:id
// modify a test descriptor in the database
router.put('/api/testDescriptor/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (req.body === undefined || req.body.newName === undefined || req.body.newProcedureDescription === undefined ||
      req.body.newIdSKU === undefined || !Number.isInteger(parseInt(req.body.newIdSKU)) ||
      parseInt(req.body.newIdSKU) < 0 || id === undefined || !Number.isInteger(id) || id < 0 ) {
    return res.status(422).json({error: `Invalid test descriptor data.`});
  }
  try{
    const db = new TestDescriptorDBU('ezwh.db');
    const dbSKU = new SkuDBU('ezwh.db');
    const skuList = await dbSKU.loadSKU(req.body.newIdSKU);
    if(skuList.length === 0)
      return res.status(404).json({error: `No sku with matching newIdSKU`, message: err.message});
    const descriptorList = await db.loadTestDescriptor(id);
    if(descriptorList.length === 0)
      return res.status(404).json({error: `No test descriptor with matching id`, message: err.message});
    const descriptor = descriptorList.pop();
    await descriptor.modify(req.body.newName, req.body.newProcedureDescription, req.body.newIdSKU);
    await db.updateTestDescriptor(descriptor);
    return res.status(200).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// DELETE /api/testDescriptor/:id
// remove a test descriptor from the database
router.delete('/api/testDescriptor/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  if (id === undefined || !Number.isInteger(id) || id < 0 ) {
    return res.status(422).json({error: `Invalid id.`});
  }
  try{
      const db = new TestDescriptorDBU('ezwh.db');
      // get the test descriptor to be deleted
      await db.deleteTestDescriptor(id);
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;