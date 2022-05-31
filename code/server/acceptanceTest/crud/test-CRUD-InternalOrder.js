const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const app = require('../../server'); 
var agent = chai.request.agent(app);

const skus = require('../utils-sku');
const internalorders = require('../utils-internalorder');
const skuitems = require('../utils-skuitems');
const restockorders = require('../utils-restockorder');
const users = require('../utils-users');

testInternalOrderCRUD();

function testInternalOrderCRUD(){

    let mysku = [];
    mysku[0] = skus.newSku('a','b',20,30,40,10);
    mysku[1] = skus.newSku('c','d',40,30,20,10);

    let rfids = [];
    rfids[0] = '12345678901234567890123456789016';
    rfids[1] = '12345678901234567890123456789038';
    
    let myskuitems = [];
    myskuitems[0] = skuitems.newSkuItem(rfids[0], 0, '2021/11/29 12:30');
    myskuitems[1] = skuitems.newSkuItem(rfids[1], 0, '2021/11/29 21:45');

    let myuser  = [];
    myuser[0] = users.newCompleteUser("supp1@ezwh.com", "supName", "supSur", "testpassword", "supplier");
    myuser[1] = users.newCompleteUser("customer1@ezwh.com", "custName", "custSur", "testpassword", "customer");

    let myproducts = [];
    myproducts[0] = restockorders.newProduct(0, "descr1", 8.99, 30);
    myproducts[1] = restockorders.newProduct(1, "descr2", 6.99, 20);

    let myinternalorders = [];
    // FIXME --- according to API.md, dates can be in the format "YYYY/MM/DD" or in format "YYYY/MM/DD HH:MM" 
    //myinternalorders[0] = internalorders.newInternalOrder("2021/11/29 9:30", myproducts, 0);
    myinternalorders[0] = internalorders.newInternalOrder("2021/11/29 09:30", myproducts, 0);
    myinternalorders[1] = internalorders.newInternalOrder("2021/11/30 21:30", myproducts, 0);

    describe('Test Internal Order CRUD features', () =>{
        // FIXME --- changed the order of deletes to enforce consistency of db
        internalorders.deleteAllInternalOrders(agent);
        skuitems.deleteAllSkuItems(agent);      
        skus.deleteAllSkus(agent);
        //
        skus.testPostNewSku(agent, mysku[0],201);
        skus.testPostNewSku(agent, mysku[1],201);
        skus.testGetAllSkus(agent, mysku,2,200);
        users.testDeleteAllNotManagerUsers(agent);
        users.testPostNewUser(agent, myuser[1], 201);
        internalorders.testPostNewInternalOrder(agent, myinternalorders[0], 201);
        internalorders.testPostNewInternalOrder(agent, myinternalorders[1], 201);
        internalorders.testPostWrongNewInternalOrders(agent, null, 422);
        internalorders.testGetAllInternalOrders(agent, 2, 200);
        internalorders.testGetAllInternalOrdersIssued(agent, 200);
        internalorders.testEditInternalOrder(agent, "ACCEPTED", 200);
        internalorders.testGetAllInternalOrdersIssued(agent, 200);
        internalorders.testGetAllInternalOrdersAccepted(agent, 200);
        // FIXME --- these products do not exist!! We first insert them
        skuitems.testPostNewSkuItem(agent, myskuitems[0], 201);
        skuitems.testPostNewSkuItem(agent, myskuitems[1], 201);
        //
        internalorders.testEditInternalOrder(agent, "COMPLETED", 200);
        internalorders.testGetAllInternalOrders(agent, 2, 200);
    });
}

exports.testInternalOrderCRUD = testInternalOrderCRUD