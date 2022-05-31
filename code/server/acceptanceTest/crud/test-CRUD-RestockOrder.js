
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const app = require('../../server'); 
var agent = chai.request.agent(app);

const users = require('../utils-users');
const skus = require('../utils-sku');
const skuitems = require('../utils-skuitems');
const restockorders = require('../utils-restockorder');

testRestockOrderCRUD();

function testRestockOrderCRUD(){
    
    let mysku = []
    mysku[0] = skus.newSku('a','b',20,30,40,10);
    mysku[1] = skus.newSku('c','d',40,30,20,10);
    
    let myuser  = [];
    myuser[0] = users.newCompleteUser("supp1@ezwh.com", "supName", "supSur", "testpassword", "supplier");
    //FIXME User can't have letter in Name and And Surname 
    //myuser[1] = users.newCompleteUser("supp2@ezwh.com", "supName2", "supSur2", "testpassword", "supplier");
    myuser[1] = users.newCompleteUser("supp2@ezwh.com", "supNameDUE", "supSurDUE", "testpassword", "supplier");

    let rfids = [];
    rfids[0] = '12345678901234567890123456789015';
    rfids[1] = '12345678901234567890123456789016';
    rfids[2] = '12345678901234567890123456789017';
    rfids[3] = '12345678901234567890123456789018';
    
    let myskuitems = [];
    myskuitems[0] = skuitems.newSkuItem(rfids[0], 0, '2021/11/29 12:30');
    myskuitems[1] = skuitems.newSkuItem(rfids[1], 0, '2021/11/29 21:45');
    //FIXME Date can't be in the future
    //myskuitems[2] = skuitems.newSkuItem(rfids[2], 1, '2022/11/29 20:45'); 
    //myskuitems[3] = skuitems.newSkuItem(rfids[3], 1, '2022/12/29 20:45');
    myskuitems[2] = skuitems.newSkuItem(rfids[2], 1, '2022/01/29 20:45');
    myskuitems[3] = skuitems.newSkuItem(rfids[3], 1, '2022/01/29 20:45');

    let addskuitems = [];
    addskuitems[0] = {"SKUId":1, "rfid":rfids[2]};
    addskuitems[1]= {"SKUId":1, "rfid":rfids[3]};


    let myproducts = [];
    myproducts[0] = restockorders.newProduct(0, "descr1", 8.99, 30);
    myproducts[1] = restockorders.newProduct(1, "descr2", 6.99, 20);

    let myrestocks = [];
    myrestocks[0] = restockorders.newRestockOrder("2022/05/16 09:33", myproducts, 0); 
    myrestocks[1] = restockorders.newRestockOrder("2022/05/17 19:00", myproducts, 1); 
    

    describe.only('Test RestockOrder CRUD features', ()=>{
        restockorders.deleteAllRestockOrders(agent);
        skuitems.deleteAllSkuItems(agent);      
        skus.deleteAllSkus(agent);
        users.testDeleteAllNotManagerUsers(agent);
        skus.testPostNewSku(agent, mysku[0], 201);
        skus.testPostNewSku(agent, mysku[1], 201);
        skus.testGetAllSkus(agent, mysku, 2, 200);
        users.testPostNewUser(agent, myuser[0], 201);
        users.testPostNewUser(agent, myuser[1], 201);
        skuitems.testPostNewSkuItem(agent, myskuitems[0], 201);
        skuitems.testPostNewSkuItem(agent, myskuitems[1], 201);
        users.testGetAllSuppliers(agent);
        restockorders.testPostNewRestockOrder(agent, myrestocks[0], 201);
        restockorders.testPostNewRestockOrder(agent, myrestocks[1], 201);
        skuitems.testPostNewSkuItem(agent, myskuitems[2], 201); 
        skuitems.testPostNewSkuItem(agent, myskuitems[3], 201); 
        restockorders.testPostNewWrongRestockOrder(agent, null, 422);
        restockorders.testGetAllRestockOrders(agent, myrestocks, 200);
        restockorders.testGetAllRestockIssued(agent, 200);
        restockorders.testEditRestockOrder(agent, "DELIVERED", 200);
        restockorders.testEditRestockOrder(agent, null, 422); //qui
        restockorders.testEditWrongRestockOrder(agent, "DELIVERED", 10000, 404);
        restockorders.testGetAllRestockOrders(agent, myrestocks, 200);
        restockorders.testEditRestockOrderSkuItems(agent, addskuitems, 200);
        restockorders.testGetAllRestockOrders(agent, myrestocks, 200);
        restockorders.testEditRestockWrongOrderSkuItems(agent, 404);
        restockorders.testEditRestockWrongBodyOrderSkuItems(agent, 422);
        restockorders.testEditRestockOrderTransportNote(agent, 422);
        restockorders.testEditRestockOrder(agent, "DELIVERY", 200);
        restockorders.testEditRestockOrderTransportNote(agent, 200);
        restockorders.testEditRestockOrderTransportNoteNotFound(agent, 404);       
        restockorders.deleteAllRestockOrders(agent);
        skuitems.deleteAllSkuItems(agent);      
        skus.deleteAllSkus(agent);
    });
}

exports.testRestockOrderCRUD = testRestockOrderCRUD