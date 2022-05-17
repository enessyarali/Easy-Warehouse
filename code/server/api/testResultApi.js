'use strict';

const express = require('express');
const TestResultDBU = require('../database_utilities/testResultDBU.js');

let router = express.Router();

function dateIsValid(dateStr, compare=true) {
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  const regex2 = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;

  if (!dateStr.match(regex) && !dateStr.match(regex2)) {
    return false;
  }

  if (compare) {
    const now = new Date();
    if(dateStr.match(regex2)){
        const [date, time] = dateStr.split(' ');
        const [year, month, day] = date.split('/');
        const [hour, minute] = time.split(':');
        const myDate = new Date(year, month - 1, day, hour, minute);
        if(!(myDate instanceof Date))
            return false;
        if(myDate.getTime() > now.getTime())
            return false;
    }
    else{
        const [year, month, day] = dateStr.split('/');
        const myDate = new Date(year, month - 1, day);
        if(!(myDate instanceof Date))
            return false;
        if(myDate.getTime() > now.getTime())
            return false;
    }
  }

  return true;
}

// GET /api/testresults
// retrieves all test results from the database
router.get('/api/skuitems/:rfid/testResults', async (req,res) => {
    const rfid = req.params.rfid;
    try {
      const db = new TestResultDBU('ezwh.db');
      const resultList = await db.loadTestResult(rfid);
      return res.status(200).json(resultList);
    } catch (err) {
        if (err.code==9)
          return res.status(404).json({error: `No SKU item with matching RFID.`});
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
      const db = new TestResultDBU('ezwh.db');
      const ResultList = await db.loadTestResult(rfid,id);
      if(ResultList.length === 0)
        return res.status(404).json({error: `No test Result with matching id.`});
    return res.status(200).json(ResultList.pop());
    } catch (err) {
        if (err.code==9)
          return res.status(404).json({error: `No SKU item with matching RFID.`});
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

  // POST /api/testResult
// add a new test Result to the database
router.post('/api/skuitems/testResult', async (req,res) => {
    if (req.body === undefined || req.body.rfid === undefined || req.body.idTestDescriptor === undefined ||
        req.body.Date === undefined || !dateIsValid(req.body.Date) ||
        req.body.Result === undefined ) {
      return res.status(422).json({error: `Invalid test Result data.`});
    }
    try{
        const db = new TestResultDBU('ezwh.db');
        await db.insertTestResult(req.body.rfid, req.body.idTestDescriptor, req.body.Date, req.body.Result);
        return res.status(201).end();
    }
    catch(err){
      if (err.code==9)
        return res.status(404).json({error: `No SKU item with matching RFID.`});
      if (err.code==11)
        return res.status(404).json({error: `No Test Descriptor with matching id.`});
      return res.status(503).json({error: `Something went wrong...`, message: err.message});
    }
  });

  // PUT /api/testresult/:id
// modify a test result in the database
router.put('/api/skuitems/:rfid/testResult/:id', async (req,res) => {
    const id = parseInt(req.params.id);
    const rfId= req.params.rfid
    if (req.body === undefined || req.body.newIdTestDescriptor === undefined || 
      req.body.newDate === undefined || !dateIsValid(req.body.newDate) ||
      req.body.newResult === undefined) {
      return res.status(422).json({error: `Invalid test result data.`});
    }
    try{
      const db = new TestResultDBU('ezwh.db');
      const isUpdated = await db.updateTestResult(rfId, id, req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult);
      if (!isUpdated)
        return res.status(404).json({error: `No test result with matching id.`});
      return res.status(200).end();
    }
    catch(err){
      if (err.code==9)
        return res.status(404).json({error: `No SKU item with matching RFID.`});
      if (err.code==11)
        return res.status(404).json({error: `No Test Descriptor with matching id.`});
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
        const db = new TestResultDBU('ezwh.db');
        await db.deleteTestResult(rfid,id);
        return res.status(204).end();
    }
    catch(err){
      return res.status(503).json({error: `Something went wrong...`, message: err.message});
    }
  });
  
  module.exports = router;