'use strict';
const express = require('express');

const skuRoute = require('./api/skuApi');
const skuItemRoute = require('./api/skuItemApi');
const positionRoute = require('./api/positionApi');
const userRoute = require('./api/userApi');
const itemRoute = require('./api/itemApi');
const testDescriptorRoute = require('./api/testDescriptorApi');

const internalOrderRoute = require('./api/internalOrderApi');
const restockOrderRoute = require('./api/restockOrderApi');
const returnOrderRoute = require('./api/returnOrderApi');

// init express
const app = new express();
const port = 3001;

app.use(express.json());
app.use('/', skuRoute);
app.use('/', skuItemRoute);
app.use('/', positionRoute);
app.use('/', userRoute);
app.use('/', itemRoute);
app.use('/', internalOrderRoute);
app.use('/', restockOrderRoute);
app.use('/', returnOrderRoute);
app.use('/', testDescriptorRoute);

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