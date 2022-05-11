'use strict';

// IMPORTANT:
//
// MISSING LOGOUT API
// Login APIs must be completed with authentication

const express = require('express');
const UserDBU = require('../database_utilities/userDBU.js');

let router = express.Router();

function mailIsValid(str) {
    const regex = /^[a-z0-9]+@[a-z.]+.[a-z]{2-3}$/;
    return str.match(regex);
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
      const managerList = await db.loadUser(null, 'manager');
      return res.status(200).json(userList.filter(user => !managerList.includes(user)));
    } catch (err) {
        return res.status(500).json({error: `Something went wrong...`, message: err.message});
    }
  });

// POST /api/newUser
// add a new user to the database
router.post('/api/newUser', async (req,res) => {
  if (req.body === undefined || req.body.username === undefined || !mailIsValid(req.body.username) ||
      req.body.name === undefined || req.body.surname === undefined || req.body.password === undefined ||
      req.body.type === undefined || req.body.type === 'manager' || req.body.type === 'administrator' ||
      req.body.password.length < 8 ) {
    return res.status(422).json({error: `Invalid user data.`});
  }
  try{
      const db = new UserDBU('ezwh.db');
      const userList = await db.loadUser(req.body.username, req.body.type);
      if(userList.length > 0)
        return res.status(409).json({error: `Already existing user`, message: err.message});
      await db.insertUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.type);
      return res.status(201).end();
  }
  catch(err){
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
        const userList = await db.loadUser(req.body.username, 'manager');
        if(userList.length = 0)
          return res.status(401).json({error: `Invalid username or password.`});
        const user = userList.pop();
        if(req.body.password !== user.password)
          return res.status(401).json({error: `Invalid username or password.`});
        return res.status(200).json({managerInfo: {id: user.id, username: user.username, name: user.name}});
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
        const userList = await db.loadUser(req.body.username, 'customer');
        if(userList.length = 0)
          return res.status(401).json({error: `Invalid username or password.`});
        const user = userList.pop();
        if(req.body.password !== user.password)
          return res.status(401).json({error: `Invalid username or password.`});
        return res.status(200).json({customerInfo: {id: user.id, username: user.username, name: user.name}});
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
        const userList = await db.loadUser(req.body.username, 'supplier');
        if(userList.length = 0)
          return res.status(401).json({error: `Invalid username or password.`});
        const user = userList.pop();
        if(req.body.password !== user.password)
          return res.status(401).json({error: `Invalid username or password.`});
        return res.status(200).json({supplierInfo: {id: user.id, username: user.username, name: user.name}});
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
        const userList = await db.loadUser(req.body.username, 'clerk');
        if(userList.length = 0)
          return res.status(401).json({error: `Invalid username or password.`});
        const user = userList.pop();
        if(req.body.password !== user.password)
          return res.status(401).json({error: `Invalid username or password.`});
        return res.status(200).json({clerkInfo: {id: user.id, username: user.username, name: user.name}});
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
        const userList = await db.loadUser(req.body.username, 'qualityEmployee');
        if(userList.length = 0)
          return res.status(401).json({error: `Invalid username or password.`});
        const user = userList.pop();
        if(req.body.password !== user.password)
          return res.status(401).json({error: `Invalid username or password.`});
        return res.status(200).json({qualityEmployeeInfo: {id: user.id, username: user.username, name: user.name}});
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
  if (req.body === undefined || (req.body.oldType !== 'customer' && req.body.oldType !== 'qualityEmployee' &&
      req.body.oldType !== 'clerk' && req.body.oldType !== 'deliveryEmployee' && req.body.oldType !== 'supplier') ||
      (req.body.newType !== 'customer' && req.body.newType !== 'qualityEmployee' && req.body.newType !== 'clerk' &&
      req.body.newType !== 'deliveryEmployee' && req.body.newType !== 'supplier') || username === undefined ||
      !mailIsValid(username) ) {
    return res.status(422).json({error: `Invalid user data.`});
  }
  try{
      const db = new UserDBU('ezwh.db');
      const userList = await db.loadUser(username, req.body.oldType);
      if(userList.length === 0)
        return res.status.apply(404).json({error: `No user with matching username or type.`});
      const user = userList.pop();
      user.setType(req.body.newType);
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
  if (username === undefined || !mailIsValid(username) || (type !== 'customer' && type !== 'qualityEmployee' &&
      type !== 'clerk' && type !== 'deliveryEmployee' && type !== 'supplier') ) {
    return res.status(422).json({error: `Invalid username or type.`});
  }
  try{
      const db = new UserDBU('ezwh.db');
      // get the user to be deleted
      const deleted = await db.deleteUser(username, type);
      return res.status(204).end();
  }
  catch(err){
    return res.status(503).json({error: `Something went wrong...`, message: err.message});
  }
});

module.exports = router;