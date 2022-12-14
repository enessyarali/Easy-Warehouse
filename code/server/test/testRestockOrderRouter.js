const RKO = require('../model/restockOrder');
const RestockOrder = RKO.RestockOrder;
const SKU = require('../model/sku');
const SkuItem = require('../model/skuItem');
const TestDescriptor = require('../model/testDescriptor');
const TestResult = require('../model/testResult');
const dbSet = require('../unit_test/dataBaseSetUp');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

/* FUNCTIONAL REQUIREMENTS
 *
 *  FR5 Manage a restock order
 *      FR5.0.1 List all restock orders
 *      FR5.0.2 List all ISSUED restock orders
 *      FR5.0.3 Get a single restock order
 *      FR5.1 Start a restock order
 *      FR5.2 Add a SKU to a restock order
 *      FR5.3 Define quantity of SKU to be ordered
 *      FR5.5 Select a Supplier for the restock order
 *      FR5.6 Issue a restock order
 *      FR5.7.1 Change state of a restock order
 *      FR5.7.2 Add transportNote data
 *      FR5.8.1 Create and tag a SKU item with an RFID
 *      FR5.10 Return a SKU item listed in a restock order
 *      FR5.11 Delete a restock order
 */

describe('test restock order apis', () => {

    let sku1 = new SKU(undefined, "Eurovision 2022 CD", 1, 1, "Fragile!", null, 8.99, 30);
    let sku2 = new SKU(undefined, "Chiara Ferragni's brand water", 1, 1, "$$$", null, 800.99, 1);
    let sku3 = new SKU(undefined, "Watermelon", 1, 1, "The best fruit. Period.", null, 6.11, 5);
    let sku4 = new SKU(undefined, "Banana", 1, 1, "The second best fruit. Period.", null, 1.03, 42);

    const si2 = new SkuItem("12345678901234567890123456789016", undefined, 0, null); 
    const si4 = new SkuItem("12345678901234567890123456789017", undefined, 0, null);

    const td1 = new TestDescriptor(undefined, "Test descriptor 1", "Look for defects in the bottle", undefined);
    const td2 = new TestDescriptor(undefined, "Test descriptor 2", "Taste the water to make sure it is not poisonous", undefined);
    const td3 = new TestDescriptor(undefined, "Test descriptor 3", "Eat the banana!", undefined);

    // test results on si2
    const tr1 = new TestResult(undefined, undefined, "2022/05/21", false);
    tr1.rfid = "12345678901234567890123456789016";
    const tr2 = new TestResult(undefined, undefined, "2022/05/21", true);
    tr2.rfid = "12345678901234567890123456789016";
    // test result on si4
    const tr3 = new TestResult(undefined, undefined, "2022/05/21", false);
    tr3.rfid = "12345678901234567890123456789017";

    const ro1 = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 5, undefined);
    ro1.setProducts([{"SKUId":undefined, "description":"Eurovision 2022 CD","price":10.99,"qty":2, "itemId": 1},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1, "itemId": 2}]);

    const ro2 = new RestockOrder(undefined, "2022/05/20 08:53", "DELIVERY", 5, '{"deliveryDate":"2022/05/29"}');
    ro2.setProducts([{"SKUId":undefined,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1, "itemId": 3},
                    {"SKUId":undefined,"description":"Banana","price":0.99,"qty":1, "itemId": 4}]);

    const ro3 = new RestockOrder(undefined, "2022/05/21 08:53", "ISSUED", 5, undefined);
    ro3.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2, "itemId": 1},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1, "itemId": 2}]);

    const ro4 = new RestockOrder(undefined, "2022/05/18 08:53", "COMPLETEDRETURN", 5, undefined);
    ro4.setProducts([{"SKUId":undefined,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1, "itemId": 3},
                    {"SKUId":undefined,"description":"Banana","price":0.99,"qty":1, "itemId": 4}]);
    ro4.setSkuItems([{"SKUId": undefined, "rfid": "12345678901234567890123456789016", "itemId": 3}, 
                            {"SKUId": undefined, "rfid": "12345678901234567890123456789017", "itemId": 4}]);

    const ro5 = new RestockOrder(undefined, "2022/05/17 08:53", "DELIVERED", 5, undefined);
    ro5.setProducts([{"SKUId":undefined,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1, "itemId": 3},
                            {"SKUId":undefined,"description":"Banana","price":0.99,"qty":1, "itemId": 4}]);

    // date has a wrong format
    const ro1_invalid = new RestockOrder(undefined, "2022-05-19", "ISSUED", 5, undefined);
    ro1_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2, "itemId": 1},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1, "itemId": 2}]);
    // date is in the future
    const ro2_invalid = new RestockOrder(undefined, "2122/05/19", "ISSUED", 5, undefined);
    ro2_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2, "itemId": 1},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1, "itemId": 2}]);
    // product has missing SKUId field
    const ro3_invalid = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 5, undefined);
    ro3_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2, "itemId": 1},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1, "itemId": 2}]);
    // supplier does not exist
    const ro4_invalid = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 1, undefined);
    ro4_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2, "itemId": 1},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1, "itemId": 2}]);
    // product has negative quantity
    const ro5_invalid = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 5, undefined);
    ro5_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2, "itemId": 1},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":-1, "itemId": 2}]);

    // populate the DB
    beforeEach(async () => {
        await dbSet.resetTable();
        await dbSet.setupHardCodedUsers();
        await agent.post('/api/sku').send(sku1);
        await agent.post('/api/sku').send(sku2);
        await agent.post('/api/sku').send(sku3);
        await agent.post('/api/sku').send(sku4);
        const skus = await agent.get('/api/skus');
        for (let s of skus.body) {
            if (s.description=="Eurovision 2022 CD") {
                sku1 = s;
            } else if (s.description=="Chiara Ferragni's brand water") {
                sku2 = s;
            } else if (s.description=="Watermelon") {
                sku3 = s;
            } else {
                sku4 = s;
            }
        }
        // set all SKU ids
        si2.SKUId = sku2.id;
        si4.SKUId = sku4.id;
        td1.idSKU = sku2.id;
        td2.idSKU = sku2.id;
        td3.idSKU = sku4.id;
        ro1.products[0].SKUId = sku1.id;
        ro1.products[1].SKUId = sku3.id;
        ro2.products[0].SKUId = sku2.id;
        ro2.products[1].SKUId = sku4.id;
        ro3.products[0].SKUId = sku1.id;
        ro3.products[1].SKUId = sku3.id;
        ro4.products[0].SKUId = sku2.id;
        ro4.products[1].SKUId = sku4.id;
        ro4.skuItems[0].SKUId = sku2.id;
        ro4.skuItems[1].SKUId = sku4.id;
        ro5.products[0].SKUId = sku2.id;
        ro5.products[1].SKUId = sku4.id;
        ro1_invalid.products[0].SKUId = sku1.id;
        ro1_invalid.products[1].SKUId = sku3.id;
        ro2_invalid.products[0].SKUId = sku1.id;
        ro2_invalid.products[1].SKUId = sku3.id;
        ro3_invalid.products[0].SKUId = sku1.id;
        // ro3_invalid.products[1].SKUId is NOT initialized by choice
        ro4_invalid.products[0].SKUId = sku1.id;
        ro4_invalid.products[1].SKUId = sku3.id;
        ro5_invalid.products[0].SKUId = sku1.id;
        ro5_invalid.products[1].SKUId = sku3.id;
        await agent.post('/api/skuitem').send(si2);
        await agent.post('/api/skuitem').send(si4);
        await agent.post('/api/testDescriptor').send(td1);
        await agent.post('/api/testDescriptor').send(td2);
        await agent.post('/api/testDescriptor').send(td3);
        const tests = await agent.get('/api/testDescriptors');
        for (let t of tests.body) {
            if (t.name=="Test descriptor 1")
                td1.id = t.id;
            else if (t.name=="Test descriptor 2") 
                td2.id = t.id;
            else td3.id = t.id;
        }
        tr1.idTestDescriptor = td1.id;
        tr2.idTestDescriptor = td2.id;
        tr3.idTestDescriptor = td3.id;
        await agent.post('/api/skuitems/testResult').send(tr1);
        await agent.post('/api/skuitems/testResult').send(tr2);
        await agent.post('/api/skuitems/testResult').send(tr3);
        const resultsSi2 = await agent.get('/api/skuitems/12345678901234567890123456789016/testResults');
        tr1.id = resultsSi2.body[0].id;
        tr2.id = resultsSi2.body[1].id;
        const resultSi4 = await agent.get('/api/skuitems/12345678901234567890123456789017/testResults');
        tr3.id = resultSi4.body[0].id;
        await agent.post('/api/restockOrder').send(ro1);
        await agent.post('/api/restockOrder').send(ro2);
        await agent.post('/api/restockOrder').send(ro4);
        await agent.post('/api/restockOrder').send(ro5);
        const orders = await agent.get('/api/restockOrders');
        for (let o of orders.body) {
            if (o.issueDate=="2022/05/19 08:53") {
                ro1.id = o.id;
            } else if (o.issueDate=="2022/05/20 08:53") {
                ro2.id = o.id;
            } else if (o.issueDate=="2022/05/18 08:53") {
                ro4.id = o.id;
            } else if (o.issueDate=="2022/05/17 08:53") {
                ro5.id = o.id;
            }
        }
        await agent.put(`/api/restockOrder/${ro2.id}`).send({"newState":"DELIVERY"});
        await agent.put(`/api/restockOrder/${ro2.id}/transportNote`).send({"transportNote":{"deliveryDate":"2022/05/29"}});
        await agent.put(`/api/restockOrder/${ro4.id}`).send({"newState":"DELIVERED"});
        await agent.put(`/api/restockOrder/${ro5.id}`).send({"newState":"DELIVERED"});
        await agent.put(`/api/restockOrder/${ro4.id}/skuItems`).send({"skuItems":[{"SKUId": si2.SKUId, "rfid": "12345678901234567890123456789016", "itemId": 3},
                                                        {"SKUId": si4.SKUId, "rfid": "12345678901234567890123456789017", "itemId": 4}]});
        await agent.put(`/api/restockOrder/${ro4.id}`).send({"newState":"COMPLETEDRETURN"});
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/restockOrder/${ro1.id}`);
        await agent.delete(`/api/restockOrder/${ro2.id}`);
        await agent.delete(`/api/restockOrder/${ro4.id}`);
        await agent.delete(`/api/restockOrder/${ro5.id}`);
        await agent.delete(`/api/skuitems/12345678901234567890123456789016/testResult/${tr1.id}`);
        await agent.delete(`/api/skuitems/12345678901234567890123456789016/testResult/${tr2.id}`);
        await agent.delete(`/api/skuitems/12345678901234567890123456789017/testResult/${tr3.id}`);
        await agent.delete(`/api/testDescriptor/${td1.id}`);
        await agent.delete(`/api/testDescriptor/${td2.id}`);
        await agent.delete(`/api/testDescriptor/${td3.id}`);
        await agent.delete('/api/skuitems/12345678901234567890123456789016');
        await agent.delete('/api/skuitems/12345678901234567890123456789017');
        await agent.delete(`/api/skus/${sku1.id}`);
        await agent.delete(`/api/skus/${sku2.id}`);
        await agent.delete(`/api/skus/${sku3.id}`);
        await agent.delete(`/api/skus/${sku4.id}`);
    });

    getAllRestockOrders('GET /api/restockOrders - retrieve all restock orders in the system', 200, [ro1, ro2, ro4, ro5]);
    getAllRestockOrders('GET /api/restockOrdersIssued - retrieve all ISSUED restock orders in the system', 200, [ro1], true);

    // the actual id is not known when the function is called: we must retrieve it later
    getRestockOrder('GET /api/restockOrders/:id - correctly get a restock order', 200, null, ro2);
    getRestockOrder('GET /api/restockOrders/:id - passing a negative id', 422, -2);
    getRestockOrder('GET /api/restockOrders/:id - order does not exist', 404, 100000000);

    getReturnItems('GET /api/restockOrders/:id/returnItems - correctly get the return items', 200, null, ro4, [{"SKUId": si4, "rfid": "12345678901234567890123456789017", "itemId": 4}],);
    getReturnItems('GET /api/restockOrders/:id/returnItems - order state is not COMPLETEDRETURN', 422, null, ro1);
    getReturnItems('GET /api/restockOrders/:id/returnItems - order does not exist', 404, 100000000);

    addRestockOrder('POST /api/restockOrder - correctly adding a restock order', 201, ro3);
    addRestockOrder('POST /api/restockOrder - wrong date format', 422, ro1_invalid);
    addRestockOrder('POST /api/restockOrder - date is in the future', 422, ro2_invalid);
    addRestockOrder('POST /api/restockOrder - product has missing SKUId field', 422, ro3_invalid);
    addRestockOrder('POST /api/restockOrder - supplier does not exist', 404, ro4_invalid);
    addRestockOrder('POST /api/restockOrder - product has negative quantity', 422, ro5_invalid);

    patchState('PUT /api/restockOrder/:id - correctly patch the state of an order', 200, {"newState":"delivered    "}, null, ro1);
    patchState('PUT /api/restockOrder/:id - state does not exist', 422, {"newState":"ACCEPTED"}, null, ro1);
    patchState('PUT /api/restockOrder/:id - order does not exist', 404, {"newState":"DELIVERED"}, 100000000);

    patchTransportNote('PUT /api/restockOrder/:id/transportNote - correctly patch the transport note of an order', 200, {"transportNote":{"deliveryDate":"2022/12/29"}}, null, ro2);
    patchTransportNote('PUT /api/restockOrder/:id/transportNote - order state is not DELIVERY', 422, {"transportNote":{"deliveryDate":"2022/12/29"}}, null, ro1);
    patchTransportNote('PUT /api/restockOrder/:id/transportNote - delivery date is before issue date', 422, {"transportNote":{"deliveryDate":"2021/12/29"}}, null, ro2);
    patchTransportNote('PUT /api/restockOrder/:id/transportNote - order does not exist', 404, {"transportNote":{"deliveryDate":"2022/12/29"}}, 100000000);

    patchSkuItems('PUT /api/restockOrder/:id/skuItems - correctly add a list of sku items to an order', 200, {"skuItems":[{"SKUId": si4, "rfid": "12345678901234567890123456789017", "itemId": 4}]}, null, ro5);
    patchSkuItems('PUT /api/restockOrder/:id/skuItems - item is not inside an array', 422, {"skuItems": {"SKUId": si4, "rfid": "12345678901234567890123456789017", "itemId": 4}}, null, ro5);
    patchSkuItems('PUT /api/restockOrder/:id/skuItems - order state is not DELIVERED', 422, {"skuItems":[{"SKUId": si4, "rfid": "12345678901234567890123456789017", "itemId": 4}]}, null, ro1);
    patchSkuItems('PUT /api/restockOrder/:id/skuItems - order id is 0', 422, {"skuItems":[{"SKUId": si4, "rfid": "12345678901234567890123456789017", "itemId": 4}]}, 0);
    patchSkuItems('PUT /api/restockOrder/:id/skuItems - typo in a sku item field', 422, {"skuItems":[{"SKUid": 4, "rfid": "12345678901234567890123456789017", "itemId": 4}]}, null, ro5);
    patchSkuItems('PUT /api/restockOrder/:id/skuItems - order does not exist', 404, {"skuItems":[{"SKUId": si4, "rfid": "12345678901234567890123456789017", "itemId": 4}]}, 100000000);

    deleteRestockOrder('DELETE /api/restockOrder/:id - correctly delete an order', 204, null, ro1);
    deleteRestockOrder('DELETE /api/restockOrder/:id - passing a negative id', 422, -2);
    deleteRestockOrder('DELETE /api/restockOrder/:id - order does not exist', 204, 100000000);
});

// FR5.0.1 List all restock orders
// FR5.0.2 List all ISSUED restock orders
// FR5.10 Return a SKU item listed in a restock order
function getAllRestockOrders(description, expectedHTTPStatus, ros, issued=false) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            let r;
            if (!issued)
                r = await agent.get('/api/restockOrders');
            else r = await agent.get('/api/restockOrdersIssued');
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(ros.length);
            let i = 0;
            for (let ro of r.body) {
                ro.id.should.equal(ros[i].id);
                ro.issueDate.should.equal(ros[i].issueDate);
                ro.state.should.equal(ros[i].state);
                // transportNote could be undefined, so we must use a different syntax
                if (ros[i].transportNote===undefined) {
                    chai.expect(ro.transportNote).to.be.undefined;
                } else {
                    JSON.stringify(ro.transportNote).should.equal(JSON.stringify(ros[i].transportNote));
                }
                ro.supplierId.should.equal(ros[i].supplierId);
                checkProducts(ro, ros[i]);
                checkSkuItems(ro.skuItems, ros[i].skuItems);
                i++;
            }
        } catch(err) {console.log(err);}
    });       
}


// FR5.0.3 Get a single restock order
// FR5.10 Return a SKU item listed in a restock order
function getRestockOrder(description, expectedHTTPStatus, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/restockOrders/${order ? order.id : id}`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                //r.body.id.should.equal(order.id);       // TO BE REMOVED
                r.body.issueDate.should.equal(order.issueDate);
                r.body.state.should.equal(order.state);
                // transportNote could be undefined, so we must use a different syntax
                if (order.transportNote===undefined) {
                    chai.expect(r.body.transportNote).to.be.undefined;
                } else {
                    JSON.stringify(r.body.transportNote).should.equal(JSON.stringify(order.transportNote));
                }
                r.body.supplierId.should.equal(order.supplierId);
                checkProducts(r.body, order);
                checkSkuItems(r.body.skuItems, order.skuItems);
            }
        } catch(err) {console.log(err);}
    });       
}

function getReturnItems(description, expectedHTTPStatus, id=undefined, order=undefined, expSkuItems=[]) {
    it(description, async function () {
        try {
            // set up SKUIds
            for (let si of expSkuItems) {
                if (si.SKUId && si.SKUId.SKUId)
                    si.SKUId = si.SKUId.SKUId;
            }
            let startTime = performance.now();
            const r = await agent.get(`/api/restockOrders/${order ? order.id : id}/returnItems`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                checkSkuItems(r.body, expSkuItems);
            }
        } catch(err) {console.log(err);}
    });       
}

///////////////// utilities to check products and skuItems are the same /////////////////
function checkProducts(dbRO, expectedRO) {
    let i = 0;
    dbRO.products.length.should.equal(expectedRO.products.length);
    for (let p of dbRO.products) {
        p.SKUId.should.equal(expectedRO.products[i].SKUId);
        p.description.should.equal(expectedRO.products[i].description);
        p.price.should.equal(expectedRO.products[i].price);
        p.qty.should.equal(expectedRO.products[i].qty);
        p.itemId.should.equal(expectedRO.products[i].itemId);
        i++;
    }
}
function checkSkuItems(siDB, expSkuItems) {
    let i = 0;
    siDB.length.should.equal(expSkuItems.length);
    // the array could be empty!
    if (siDB.length !== 0) {
        for (let s of siDB) {
            s.SKUId.should.equal(expSkuItems[i].SKUId);
            s.rfid.should.equal(expSkuItems[i].rfid);
            s.itemId.should.equal(expSkuItems[i].itemId);
            i++;
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////////


// FR5.1 Start a restock order
// FR5.2 Add a SKU to a restock order
// FR5.3 Define quantity of SKU to be ordered
// FR5.5 Select a Supplier for the restock order
// FR5.6 Issue a restock order
// FR5.11 Delete a restock order
function addRestockOrder(description, expectedHTTPStatus, order) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/restockOrder').send(order);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the get-deletion
                const orders = await agent.get('/api/restockOrdersIssued');
                for (let o of orders.body)
                    if(o.issueDate==order.issueDate) {
                        order.id = o.id;
                    }
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/restockOrder/${order.id}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR5.7.1 Change state of a restock order
function patchState(description, expectedHTTPStatus, newState, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/restockOrder/${order ? order.id : id}`).send(newState);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

// FR5.7.2 Add transportNote data
function patchTransportNote(description, expectedHTTPStatus, transportNote, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/restockOrder/${order ? order.id : id}/transportNote`).send(transportNote);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

// FR5.8.1 Create and tag a SKU item with an RFID
function patchSkuItems(description, expectedHTTPStatus, skuItems, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            // set up SKUIds
            try {
                for (let si of skuItems.skuItems) {
                    if (si.SKUId && si.SKUId.SKUId)
                        si.SKUId = si.SKUId.SKUId;
                }
            } catch {
                if (skuItems.skuItems.SKUId && skuItems.skuItems.SKUId.SKUId)
                    skuItems.skuItems.SKUId = skuItems.skuItems.SKUId.SKUId;
            }
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/restockOrder/${order ? order.id : id}/skuItems`).send(skuItems);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}


// FR5.11 Delete a restock order
function deleteRestockOrder(description, expectedHTTPStatus, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/restockOrder/${order ? order.id : id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}