'use strict';
const express = require('express');

const skuRoute = require('./api/skuApi.js');

// init express
const app = new express();
const port = 3001;

app.use(express.json());
app.use('/', skuRoute);

//GET /api/test
app.get('/api/hello', (req,res)=>{
  let message = {
    message: 'Hello World!'
  }
  return res.status(200).json(message);
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});