const RKO = require('../model/restockOrder');
const RestockOrder = RKO.RestockOrder;
const ProductRKO = RKO.ProductRKO;
const SKU = require('../model/sku');
const SkuItem = require('../model/skuItem');

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

    const ro1 = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 5, undefined);
    ro1.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1}]);

    const ro2 = new RestockOrder(undefined, "2022/05/20 08:53", "DELIVERY", 5, '{"deliveryDate":"2022/05/29"}');
    ro2.setProducts([{"SKUId":undefined,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1},
                    {"SKUId":undefined,"description":"Banana","price":0.99,"qty":1}]);

    const ro3 = new RestockOrder(undefined, "2022/05/21 08:53", "ISSUED", 5, undefined);
    ro3.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1}]);

    // date has a wrong format
    const ro1_invalid = new RestockOrder(undefined, "2022-05-19", "ISSUED", 5, undefined);
    ro1_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1}]);
    // date is in the future
    const ro2_invalid = new RestockOrder(undefined, "2122/05/19", "ISSUED", 5, undefined);
    ro2_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1}]);
    // product has missing SKUId field
    const ro3_invalid = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 5, undefined);
    ro3_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1}]);
    // supplier does not exist
    const ro4_invalid = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 1, undefined);
    ro4_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":1}]);
    // product has negative quantity
    const ro5_invalid = new RestockOrder(undefined, "2022/05/19 08:53", "ISSUED", 5, undefined);
    ro5_invalid.setProducts([{"SKUId":undefined,"description":"Eurovision 2022 CD","price":10.99,"qty":2},
                    {"SKUId":undefined,"description":"Watermelon","price":7.99,"qty":-1}]);

    // populate the DB
    beforeEach(async () => {
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
        ro1.products[0].SKUId = sku1.id;
        ro1.products[1].SKUId = sku3.id;
        ro2.products[0].SKUId = sku2.id;
        ro2.products[1].SKUId = sku4.id;
        ro3.products[0].SKUId = sku1.id;
        ro3.products[1].SKUId = sku3.id;
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
        await agent.post('/api/restockOrder').send(ro1);
        await agent.post('/api/restockOrder').send(ro2);
        const orders = await agent.get('/api/restockOrders');
        for (let o of orders.body) {
            if (o.issueDate=="2022/05/19 08:53") {
                ro1.id = o.id;
            } else if (o.issueDate=="2022/05/20 08:53") {
                ro2.id = o.id;
            }
        }
        await agent.put(`/api/restockOrder/${ro2.id}`).send({"newState":"DELIVERY"});
        await agent.put(`/api/restockOrder/${ro2.id}/transportNote`).send({"transportNote":{"deliveryDate":"2022/05/29"}});
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/restockOrder/${ro1.id}`);
        await agent.delete(`/api/restockOrder/${ro2.id}`);
        await agent.delete(`/api/skus/${sku1.id}`);
        await agent.delete(`/api/skus/${sku2.id}`);
        await agent.delete(`/api/skus/${sku3.id}`);
        await agent.delete(`/api/skus/${sku4.id}`);
    });

    getAllRestockOrders('GET /api/restockOrders - retrieve all restock orders in the system', 200, [ro1, ro2]);
    getAllRestockOrders('GET /api/restockOrdersIssued - retrieve all ISSUED restock orders in the system', 200, [ro1], true);

    // the actual id is not known when the function is called: we must retrieve it later
    getRestockOrder('GET /api/restockOrders/:id - correctly get a restock order', 200, null, ro2);
    getRestockOrder('GET /api/restockOrders/:id - passing a negative id', 422, -2);
    getRestockOrder('GET /api/restockOrders/:id - order does not exist', 404, 100000000);

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

    deleteRestockOrder('DELETE /api/restockOrder/:id - correctly delete an order', 204, null, ro1);
    deleteRestockOrder('DELETE /api/restockOrder/:id - passing a negative id', 422, -2);
    deleteRestockOrder('DELETE /api/restockOrder/:id - order does not exist', 404, 100000000); 
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
                checkSkuItems(ro, ros[i]);
                i++;
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
        i++;
    }
}
function checkSkuItems(dbRO, expectedRO) {
    let i = 0;
    dbRO.skuItems.length.should.equal(expectedRO.skuItems.length);
    // the array could be empty!
    if (expectedRO.skuItems.length !== 0) {
        for (let s of dbRO.skuItems) {
            s.SKUId.should.equal(expectedRO.skuItems[i].SKUId);
            s.rfid.should.equal(expectedRO.skuItems[i].rfid);
            i++;
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////////

// FR5.0.3 Get a single restock order
// FR5.10 Return a SKU item listed in a restock order
function getRestockOrder(description, expectedHTTPStatus, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/restockOrders/${id ? id : order.id}`);
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
                checkSkuItems(r.body, order);
            }
        } catch(err) {console.log(err);}
    });       
}

  ///////////////// TODO /////////////////////
 //        GET THE RETURN ITEMS            //
////////////////////////////////////////////


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
            const rUpdate = await agent.put(`/api/restockOrder/${id ? id : order.id}`).send(newState);
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
            const rUpdate = await agent.put(`/api/restockOrder/${id ? id : order.id}/transportNote`).send(transportNote);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

  ///////////////// TODO /////////////////////
 //          PATCH SKU ITEMS               //
////////////////////////////////////////////

// FR5.11 Delete a restock order
function deleteRestockOrder(description, expectedHTTPStatus, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/restockOrder/${id ? id : order.id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}