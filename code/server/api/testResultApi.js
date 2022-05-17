'use strict';

const express = require('express');
const testResultDBU = require('../database_utilities/testResultDBU.js');
const SkuDBU = require('../database_utilities/skuDBU.js');

let router = express.Router();

// GET /api/testresults
// retrieves all test results from the database
router.get('/api/skuitems/:rfid/testResults', async (req,res) => {
    const rfid = req.params.rfid;
    try {
      const db = new testResultDBU('ezwh.db');
      const resultList = await db.loadTestResult(rfid);
      return res.status(200).json(resultList);
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

  // GET api/skuitems/:rfid/testResults/:id
router.get('/api/skuitems/:rfid/testResults/:id', async (req,res) => {
    const id = parseInt(req.params.id);
    const rfid = req.params.rfid
    if(!Number.isInteger(id) || id < 0 ) {
        res.status(422).json({error: `Invalid  Test Result id.`});
    }
    try {
      const db = new testResultDBU('ezwh.db');
      const ResultList = await db.loadTestResult(id,rfid);
      if(ResultList.length === 0)
        return res.status(404).json({error: `No test Result with matching id.`});
    return res.status(200).json(ResultList);
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

  // POST /api/testResult
// add a new test Result to the database
router.post('/api/skuitems/testResult', async (req,res) => {
    if (req.body === undefined || req.body.SKUitemId === undefined || req.body.descriptorid === undefined ||
        req.body.date === undefined || req.body.result === undefined ) {
      return res.status(422).json({error: `Invalid test Result data.`});
    }
    try{
        const db = new testResultDBU('ezwh.db');
        await db.insertTestResult(req.body.SKUitemId, req.body.descriptorid, req.body.date,req.body.result);
        return res.status(201).end();
    }
    catch(err){
      if (code==3)
        return res.status(404).json({error: `No SKU with matching id.`});
      return res.status(503).json({error: `Something went wrong...`, message: err.message});
    }
  });

  // PUT /api/testresult/:id
// modify a test result in the database
router.put('/api/skuitems/:rfid/testResult/:id', async (req,res) => {
    const id = parseInt(req.params.id);
    const rfId= req.params.rfid
    if (req.body === undefined || req.body.newTestDescriptorId === undefined || req.body.newDate === undefined ||req.body.newResult) {
      return res.status(422).json({error: `Invalid test result data.`});
    }
    try{
      const db = new testResultDBU('ezwh.db');
      const isUpdated = await db.updateTestResult(req.body.id, req.body.newTestDescriptorId, req.body.newDate, req.body.newResult);
      if (!isUpdated)
        return res.status(404).json({error: `No test result with matching id.`});
      return res.status(200).end();
    }
    catch(err){
      if (code==3)
        return res.status(404).json({error: `No SKU with matching id.`});
      return res.status(503).json({error: `Something went wrong...`, message: err.message});
    }
  });

  // DELETE /api/skuitems/:rfid/testResult/:id
// remove a test result from the database
router.delete('/api/skuitems/:rfid/testResult/:id', async (req,res) => {
    const id = parseInt(req.params.id);
    const rfid = req.params.rfid;
    if (id === undefined || !Number.isInteger(id) || id < 0 || rfid === undefined) {
      return res.status(422).json({error: `Invalid id.`});
    }
    try{
        const db = new testResultDBU('ezwh.db');
        await db.deleteTestResult(rfid,id);
        return res.status(204).end();
    }
    catch(err){
      return res.status(503).json({error: `Something went wrong...`, message: err.message});
    }
  });
  
  module.exports = router;