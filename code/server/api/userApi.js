'use strict';

// IMPORTANT:
//
// MISSING LOGOUT API
// Login APIs must be completed with authentication

const express = require('express');
const UserDBU = require('../database_utilities/userDBU.js');

let router = express.Router();

function mailIsValid(str) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return str.match(regex);
}

function getType(str) {
  const clean = str.trim().toLowerCase();
  switch (clean) {
    case "customer":
      return "customer";
    case "qualityemployee":
      return "qualityEmployee";
    case "clerk":
      return "clerk";
    case "deliveryemployee":
      return "deliveryEmployee";
    case "supplier":
      return "supplier";
    case "manager":
      return "manager";
    default:
      return undefined;
  }
}

// GET /api/userinfo
// retrieves user informations
// router.get('/api/userinfo', async (req,res) => {});

// GET /api/suppliers
// retrieves all suppliers from the database
router.get('/api/suppliers', async (req,res) => {
    try {
      const db = new UserDBU('ezwh.db');
      const supplierList = await db.loadUser(null, 'supplier');
      return res.status(200).json(supplierList);
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// GET /api/users
// retrieves all non manager users from the database
router.get('/api/users', async (req,res) => {
    try {
      const db = new UserDBU('ezwh.db');
      const userList = await db.loadUser();
      return res.status(200).json(userList);
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/newUser
// add a new user to the database
router.post('/api/newUser', async (req,res) => {
  const type = req.body && req.body.type;  
  if (req.body === undefined || req.body.username === undefined || !mailIsValid(req.body.username) ||
      req.body.name === undefined || req.body.surname === undefined || req.body.password === undefined ||
      type === undefined || type === 'manager' || type === 'administrator' || !getType(type) ||
      req.body.password.length < 8 ) {
    return res.status(422).json({error: `Invalid user data.`});
  }
  try{
      const db = new UserDBU('ezwh.db');
      await db.insertUser(req.body.username, req.body.name, req.body.surname, req.body.password, getType(type));
      return res.status(201).end();
  }
  catch(err){
    if (err.code === 2)
      return res.status(409).json({error: `Already existing user`});
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// POST /api/managerSessions
// allow manager login
router.post('/api/managerSessions', async (req,res) => {
    if (req.body === undefined || req.body.username === undefined || !mailIsValid(req.body.username) ||
        req.body.password === undefined || req.body.password.length < 8 ) {
      return res.status(401).json({error: `Invalid username or password.`});
    }
    try{
        const db = new UserDBU('ezwh.db');
        const info = await db.checkPassword(req.body.username, "manager", req.body.password);
        if (!info)
          return res.status(401).json({error: `Invalid username or password.`});
        return res.status(200).json({managerInfo: info});
    }
    catch(err){
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/customerSessions
// allow customer login
router.post('/api/customerSessions', async (req,res) => {
    if (req.body === undefined || req.body.username === undefined || !mailIsValid(req.body.username) ||
        req.body.password === undefined || req.body.password.length < 8 ) {
      return res.status(401).json({error: `Invalid username or password.`});
    }
    try{
      const db = new UserDBU('ezwh.db');
      const info = await db.checkPassword(req.body.username, "customer", req.body.password);
      if (!info)
        return res.status(401).json({error: `Invalid username or password.`});
      return res.status(200).json({customerInfo: info});
    }
    catch(err){
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/supplierSessions
// allow supplier login
router.post('/api/supplierSessions', async (req,res) => {
    if (req.body === undefined || req.body.username === undefined || !mailIsValid(req.body.username) ||
        req.body.password === undefined || req.body.password.length < 8 ) {
      return res.status(401).json({error: `Invalid username or password.`});
    }
    try{
      const db = new UserDBU('ezwh.db');
      const info = await db.checkPassword(req.body.username, "supplier", req.body.password);
      if (!info)
        return res.status(401).json({error: `Invalid username or password.`});
      return res.status(200).json({supplierInfo: info});
    }
    catch(err){
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/clerkSessions
// allow clerk login
router.post('/api/clerkSessions', async (req,res) => {
    if (req.body === undefined || req.body.username === undefined || !mailIsValid(req.body.username) ||
        req.body.password === undefined || req.body.password.length < 8 ) {
      return res.status(401).json({error: `Invalid username or password.`});
    }
    try{
      const db = new UserDBU('ezwh.db');
      const info = await db.checkPassword(req.body.username, "clerk", req.body.password);
      if (!info)
        return res.status(401).json({error: `Invalid username or password.`});
      return res.status(200).json({clerkInfo: info});
    }
    catch(err){
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/qualityEmployeeSessions
// allow quality employee login
router.post('/api/qualityEmployeeSessions', async (req,res) => {
    if (req.body === undefined || req.body.username === undefined || !mailIsValid(req.body.username) ||
        req.body.password === undefined || req.body.password.length < 8 ) {
      return res.status(401).json({error: `Invalid username or password.`});
    }
    try{
      const db = new UserDBU('ezwh.db');
      const info = await db.checkPassword(req.body.username, "qualityEmployee", req.body.password);
      if (!info)
        return res.status(401).json({error: `Invalid username or password.`});
      return res.status(200).json({qualityEmployeeInfo: info});
    }
    catch(err){
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/logout
// allow logout
router.post('/api/logout', async (req,res) => {
    try{
        //
        //
        // TO DO
        //
        //
    }
    catch(err){
      return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// PUT /api/users/:username
// modify rights of a user in the database
router.put('/api/users/:username', async (req,res) => {
  const username = req.params.username;
  if (req.body === undefined || req.body.oldType === undefined || req.body.oldType === 'manager' ||
    req.body.oldType === 'administrator' || !getType(req.body.oldType) || req.body.newType === undefined || 
    req.body.newType === 'manager' || req.body.newType === 'administrator' || !getType(req.body.newType) || 
    username === undefined || !mailIsValid(username) ) {
    return res.status(422).json({error: `Invalid user data.`});
  }
  try{
      const db = new UserDBU('ezwh.db');
      const userList = await db.loadUser(username, getType(req.body.oldType));
      if(userList.length === 0)
        return res.status(404).json({error: `No user with matching (username, type).`});
      const user = userList.pop();
      user.setType(getType(req.body.newType));
      await db.updateUser(user);
      return res.status(200).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

// DELETE /api/users/:username/:type
// remove a user from the database
router.delete('/api/users/:username/:type', async (req,res) => {
  const username = req.params.username;
  const type = req.params.type;
  if (username === undefined || !mailIsValid(username) || type === 'manager' || 
  type === 'administrator' || !getType(type) ) {
    return res.status(422).json({error: `Invalid username or type.`});
  }
  try{
      const db = new UserDBU('ezwh.db');
      // get the user to be deleted
      const deleted = await db.deleteUser(username, getType(type));
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;