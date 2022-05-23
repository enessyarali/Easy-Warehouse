'use strict';

const IO = require('../model/internalOrder');
const InternalOrder = IO.InternalOrder;
const SKU = require('../model/sku');
const SkuItem = require('../model/skuItem');
const dbSet = require('../unit_test/dataBaseSetUp');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

/* FUNCTIONAL REQUIREMENTS
 *
 *  FR6 Manage an internal order
 *      FR6.1 Start an internal order
 *      FR6.2 Add a SKU to an internal order
 *      FR6.3 Define quantity of SKU to be ordered
 *      FR6.4 Delete a SKU from an internal order
 *      FR6.5 Issue an internal order
 *      FR6.6 Accept, reject or cancel an internal order
 *      FR6.7 Change state of an internal order
 *      FR6.8 Manage delivery of an internal order
 *      FR6.9 Select SKU with a FIFO criterion
 *      FR6.10 Remove SKU item from warehouse
 */

describe('test internal order apis', () => {

    const sku1 = new SKU(1, "Eurovision 2022 CD", 1, 1, "Fragile!", null, 10.99, 30);
    const sku2 = new SKU(2, "Chiara Ferragni's brand water", 1, 1, "$$$", null, 1000.99, 1);
    const sku3 = new SKU(3, "Watermelon", 1, 1, "The best fruit. Period.", null, 7.99, 5);
    const sku4 = new SKU(4, "Banana", 1, 1, "The second best fruit. Period.", null, 0.99, 42);

    const si1 = new SkuItem("12345678901234567890123456789016", 2, 0, null); 
    const si2 = new SkuItem("12345678901234567890123456789017", 4, 0, null);

    const io1 = new InternalOrder(1, "2022/05/23 11:30", "ISSUED", 1);
    io1.setProducts([
        {"SKUId":1,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
        {"SKUId":3,"description":"Watermelon","price":7.99,"qty":1}
    ]);
    const io2 = new InternalOrder(2, "2022/05/23 12:00", "COMPLETED", 1);
    io2.setProducts([
        {"SKUId":2,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1},
        {"SKUId":4,"description":"Banana","price":0.99,"qty":1}
    ]);
    const io3 = new InternalOrder(3, "2022/05/23 13:30", "ACCEPTED", 1);
    io3.setProducts([
        {"SKUId":1,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
        {"SKUId":3,"description":"Watermelon","price":7.99,"qty":1}
    ]);
    const io4 = new InternalOrder(4, "2022/05/23 14:00", "ISSUED", 1);
    io4.setProducts([
        {"SKUId":2,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1},
        {"SKUId":4,"description":"Banana","price":0.99,"qty":1}
    ]);
    const io_invalid1 = new InternalOrder(5, "DnAoTtE", undefined, 1);
    io4.setProducts([
        {"SKUId":2,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1},
        {"SKUId":4,"description":"Banana","price":0.99,"qty":1}
    ]);
    const io_invalid2 = new InternalOrder(6, "2022/05/23 14:30", "ISSUED", 1);
    io4.setProducts([
        {"SKUId":2,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1},
        {"SKUId":"Not a SKU"}
    ]);
    const newIo1 = {"newState":"ACCEPTED"};
    const newIo2 = {
        "newState":"COMPLETED",
        "products":[
            {"SkuID":2,"RFID":"12345678901234567890123456789016"},
            {"SkuID":4,"RFID":"12345678901234567890123456789017"}
        ]
    };
    const newIo_invalid1 = {"newState":"sasageyo"};
    const newIo_invalid2 = {
        "newState":"COMPLETED",
        "products":[
            {"SkuID":-123,"RFID":"12345678901234567890123456789016"},
            {"SkuID":4,"RFID":"12345678901234567890123456789017"}
        ]
    };

    // populate the DB
    beforeEach(async () => {
        await dbSet.resetAutoInc();
        await agent.post('/api/sku').send(sku1);
        await agent.post('/api/sku').send(sku2);
        await agent.post('/api/sku').send(sku3);
        await agent.post('/api/sku').send(sku4);
        await agent.post('/api/skuitem').send(si1);
        await agent.post('/api/skuitem').send(si2);
        await agent.post('/api/internalOrder').send(io1);
        await agent.post('/api/internalOrder').send(io2);
        await agent.put(`/api/internalOrders/${io2.id}`).send({
            "newState":"COMPLETED",
            "products":[
                {"SkuID":2,"RFID":"12345678901234567890123456789016"},
                {"SkuID":4,"RFID":"12345678901234567890123456789017"}
            ]
        });
        await agent.put(`/api/internalOrders/${io3.id}`).send({
            "newState":"ACCEPTED"
        });
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/internalOrder/1`);
        await agent.delete(`/api/internalOrder/2`);
        await agent.delete('/api/skuitems/12345678901234567890123456789016');
        await agent.delete('/api/skuitems/12345678901234567890123456789017');
        await agent.delete(`/api/skus/1`);
        await agent.delete(`/api/skus/2`);
        await agent.delete(`/api/skus/3`);
        await agent.delete(`/api/skus/4`);
    });

    getAllInternalOrders('GET /api/internalOrders - retrieve all internal orders in the system', 200, [io1, io2]);
    getAllInternalOrders('GET /api/internalOrdersIssued - retrieve all ISSUED internal orders in the system', 200, [io1], "Issued");
    getAllInternalOrders('GET /api/internalOrdersAccepted - retrieve all ACCEPTED internal orders in the system', 200, [io3], "Accepted");

    getInternalOrder('GET /api/internalOrders/:id - correctly get an internal order', 200, 2, io2);
    getInternalOrder('GET /api/internalOrders/:id - unexisting internal order id', 404, 2048);
    getInternalOrder('GET /api/internalOrders/:id - wrong internal order id', 422, "minecraft");

    addInternalOrder('POST /api/internalOrder - correctly adding an internal order', 201, io4);
    addInternalOrder('POST /api/internalOrder - wrong internal order data 1', 422, io_invalid1);
    addInternalOrder('POST /api/internalOrder - wrong internal order data 2', 422, io_invalid2);

    modifyState('PUT /api/internalOrders/:id - correctly update state of an internal order', 200, io1.id, newIo1);
    modifyState('PUT /api/internalOrders/:id - correctly update state of an internal order to COMPLETED', 200, io1.id, newIo2);
    modifyState('PUT /api/internalOrders/:id - unexisting internal order id', 404, 6009, newIo1);
    modifyState('PUT /api/internalOrders/:id - wrong internal order id', 422, "ciboDellaMensa", newIo1);
    modifyState('PUT /api/internalOrders/:id - wrong internal order data', 422, io1.id, newIo_invalid1);
    modifyState('PUT /api/internalOrders/:id - wrong internal order (to COMPLETED) data', 422, io1.id, newIo_invalid2);

    deleteInternalOrder('DELETE /api/internalOrders/:id - correctly delete an internal order', 204, io1.id);
    deleteInternalOrder('DELETE /api/internalOrders/:id - passing a negative id', 422, -2);
});

function getAllInternalOrders(description, expectedHTTPStatus, ios, status="") {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/internalOrders${status}`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(ios.length);
            let i = 0;
            for (let io of r.body) {
                io.id.should.equal(ios[i].id);
                io.issueDate.should.equal(ios[i].issueDate);
                io.state.should.equal(ios[i].state);
                io.customerId.should.equal(ios[i].customerId);
                checkProducts(io, ios[i], io.state === "COMPLETED");
                i++;
            }
        } catch(err) {console.log(err);}
    });       
}

function getInternalOrder(description, expectedHTTPStatus, id, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/internalOrders/${id}`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                r.body.id.should.equal(order.id);
                r.body.issueDate.should.equal(order.issueDate);
                r.body.state.should.equal(order.state);
                r.body.customerId.should.equal(order.customerId);
                checkProducts(r.body, order, r.body.state === "COMPLETED");
            }
        } catch(err) {console.log(err);}
    });       
}

///////////////// utilities to check products and skuItems are the same /////////////////
function checkProducts(dbIO, expectedIO, completed) {
    let i = 0;
    dbIO.products.length.should.equal(expectedIO.products.length);
    for (let p of dbIO.products) {
        p.SKUId.should.equal(expectedIO.products[i].SKUId);
        p.description.should.equal(expectedIO.products[i].description);
        p.price.should.equal(expectedIO.products[i].price);
        if(completed)
            p.RFID.should.equal(expectedIO.products[i].RFID);
        else
            p.qty.should.equal(expectedIO.products[i].qty);
        i++;
    }
}
/////////////////////////////////////////////////////////////////////////////////////////

function addInternalOrder(description, expectedHTTPStatus, order) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/internalOrders').send(order);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the deletion
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/internalOrders/${order.id}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

function modifyState(description, expectedHTTPStatus, id, newState) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/internalOrders/${id}`).send(newState);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

function deleteInternalOrder(description, expectedHTTPStatus, id) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/restockOrder/${id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}