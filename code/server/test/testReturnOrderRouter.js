const RKO = require('../model/restockOrder');
const RestockOrder = RKO.RestockOrder;
const RTO = require('../model/returnOrder');
const ReturnOrder = RTO.ReturnOrder;
const SKU = require('../model/sku');
const SkuItem = require('../model/skuItem');
const TestDescriptor = require('../model/testDescriptor');
const TestResult = require('../model/testResult');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

describe('test return order apis', () => {

    let sku2 = new SKU(undefined, "Chiara Ferragni's brand water", 1, 1, "$$$", null, 800.99, 1);
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

    const ro4 = new RestockOrder(undefined, "2022/05/18 08:53", "COMPLETEDRETURN", 5, undefined);
    ro4.setProducts([{"SKUId":undefined,"description":"Chiara Ferragni's brand water","price":1000.99,"qty":1},
                    {"SKUId":undefined,"description":"Banana","price":0.99,"qty":1}]);
    ro4.setSkuItems([{"SKUId": undefined, "rfid": "12345678901234567890123456789016"}, 
                            {"SKUId": undefined, "rfid": "12345678901234567890123456789017"}]);

    const rt = new ReturnOrder(undefined, "2022/05/21", undefined);
    rt.setProducts([{"SKUId":undefined,"description":"Banana","price":0.99, "RFID": "12345678901234567890123456789017"}]);

    // wrong date format
    const rt1_invalid = new ReturnOrder(undefined, "2022/05/21 8.09", undefined);
    rt1_invalid.setProducts([{"SKUId":undefined,"description":"Banana","price":0.99, "RFID": "12345678901234567890123456789017"}]);
    // restock order does not exist
    const rt2_invalid = new ReturnOrder(undefined, "2022/05/21", 1000000000);
    rt2_invalid.setProducts([{"SKUId":undefined,"description":"Banana","price":0.99, "RFID": "12345678901234567890123456789017"}]);
    // restock order id is equal to 0
    const rt3_invalid = new ReturnOrder(undefined, "2022/05/21", 0);
    rt3_invalid.setProducts([{"SKUId":undefined,"description":"Banana","price":0.99, "RFID": "12345678901234567890123456789017"}]);
    // product has negative price
    const rt4_invalid = new ReturnOrder(undefined, "2022/05/21", undefined);
    rt4_invalid.setProducts([{"SKUId":undefined,"description":"Banana","price":-0.99, "RFID": "12345678901234567890123456789017"}]);

    // populate the DB
    beforeEach(async () => {
        await agent.post('/api/sku').send(sku2);
        await agent.post('/api/sku').send(sku4);
        const skus = await agent.get('/api/skus');
        for (let s of skus.body) {
            if (s.description=="Chiara Ferragni's brand water") {
                sku2 = s;
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
        ro4.products[0].SKUId = sku2.id;
        ro4.products[1].SKUId = sku4.id;
        ro4.skuItems[0].SKUId = sku2.id;
        ro4.skuItems[1].SKUId = sku4.id;
        rt.products[0].SKUId = sku4.id;
        rt1_invalid.products[0].SKUId = sku4.id;
        rt2_invalid.products[0].SKUId = sku4.id;
        rt3_invalid.products[0].SKUId = sku4.id;
        rt4_invalid.products[0].SKUId = sku4.id;
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
        await agent.post('/api/restockOrder').send(ro4);
        const orders = await agent.get('/api/restockOrders');
        ro4.id = orders.body[0].id;
        rt.restockOrderId = ro4.id;
        rt1_invalid.restockOrderId = ro4.id;
        rt4_invalid.restockOrderId = ro4.id;
        await agent.put(`/api/restockOrder/${ro4.id}`).send({"newState":"DELIVERED"});
        await agent.put(`/api/restockOrder/${ro4.id}/skuItems`).send({"skuItems":[{"SKUId": si2.SKUId, "rfid": "12345678901234567890123456789016"},
                                                        {"SKUId": si4.SKUId, "rfid": "12345678901234567890123456789017"}]});
        await agent.put(`/api/restockOrder/${ro4.id}`).send({"newState":"COMPLETEDRETURN"});
        await agent.post('/api/returnOrder').send(rt);
        const ret = await agent.get('/api/returnOrders');
        rt.id = ret.body[0].id;
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/returnOrder/${rt.id}`);
        await agent.delete(`/api/restockOrder/${ro4.id}`);
        await agent.delete(`/api/skuitems/12345678901234567890123456789016/testResult/${tr1.id}`);
        await agent.delete(`/api/skuitems/12345678901234567890123456789016/testResult/${tr2.id}`);
        await agent.delete(`/api/skuitems/12345678901234567890123456789017/testResult/${tr3.id}`);
        await agent.delete(`/api/testDescriptor/${td1.id}`);
        await agent.delete(`/api/testDescriptor/${td2.id}`);
        await agent.delete(`/api/testDescriptor/${td3.id}`);
        await agent.delete('/api/skuitems/12345678901234567890123456789016');
        await agent.delete('/api/skuitems/12345678901234567890123456789017');
        await agent.delete(`/api/skus/${sku2.id}`);
        await agent.delete(`/api/skus/${sku4.id}`);
    });

    getAllReturnOrders('GET /api/returnOrders - retrieve all return orders in the system', 200, [rt]);
    
    // the actual id is not known when the function is called: we must retrieve it later
    getReturnOrder('GET /api/returnOrders/:id - correctly get a return order', 200, null, rt);
    getReturnOrder('GET /api/returnOrders/:id - passing an id equal to 0', 422, 0);
    getReturnOrder('GET /api/returnOrders/:id - order does not exist', 404, 100000000);

    //addReturnOrder('POST /api/returnOrder - correctly adding a return order', 201, rt);
    addReturnOrder('POST /api/returnOrder - wrong date format', 422, rt1_invalid);
    addReturnOrder('POST /api/returnOrder - restock order does not exist', 404, rt2_invalid);
    addReturnOrder('POST /api/returnOrder - restock order id is equal to 0', 422, rt3_invalid);
    addReturnOrder('POST /api/returnOrder - product has negative price', 422, rt4_invalid);
    
    deleteReturnOrder('DELETE /api/returnOrder/:id - correctly delete an order', 204, null, rt);
    deleteReturnOrder('DELETE /api/returnOrder/:id - passing a negative id', 422, -2);
    deleteReturnOrder('DELETE /api/returnOrder/:id - order does not exist', 404, 100000000);
});

function getAllReturnOrders(description, expectedHTTPStatus, orders) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/returnOrders');
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(orders.length);
            let i = 0;
            for (let rt of r.body) {
                rt.id.should.equal(orders[i].id);
                rt.returnDate.should.equal(orders[i].returnDate);
                rt.restockOrderId.should.equal(orders[i].restockOrderId);
                checkProducts(rt, orders[i]);
                i++;
            }
        } catch(err) {console.log(err);}
    });       
}

function getReturnOrder(description, expectedHTTPStatus, id, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/returnOrders/${order ? order.id : id}`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if (r.status==200) {
                r.body.returnDate.should.equal(order.returnDate);
                r.body.restockOrderId.should.equal(order.restockOrderId);
                checkProducts(r.body, order);
            }
        } catch(err) {console.log(err);}
    });       
}

///////////////// utilities to check products are the same /////////////////
function checkProducts(dbRT, expectedRT) {
    let i = 0;
    dbRT.products.length.should.equal(expectedRT.products.length);
    for (let p of dbRT.products) {
        p.SKUId.should.equal(expectedRT.products[i].SKUId);
        p.description.should.equal(expectedRT.products[i].description);
        p.price.should.equal(expectedRT.products[i].price);
        p.RFID.should.equal(expectedRT.products[i].RFID);
        i++;
    }
}
////////////////////////////////////////////////////////////////////////////

function addReturnOrder(description, expectedHTTPStatus, order) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/returnOrder').send(order);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the get-deletion
                const orders = await agent.get('/api/returnOrders');
                for (let o of orders.body)
                    if(o.restockOrderId==order.restockOrderId) {
                        order.id = o.id;
                    }
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/returnOrder/${order.id}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

function deleteReturnOrder(description, expectedHTTPStatus, id=undefined, order=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/returnOrder/${order ? order.id : id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}