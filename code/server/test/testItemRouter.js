'use strict';

const Item = require('../model/item');
const SKU = require('../model/sku');
const dbSet = require('../unit_test/dataBaseSetUp');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

/* FUNCTIONAL REQUIREMENTS
 * 
 * FR7 Manage Items
 *   FR7.1.1 Define a new item
 *   FR7.1.2 Delete an item
 *   FR7.1.3.1 List all items
 *   FR7.1.3.2 Get 1 item
 *   FR7.1.4 Modify an existing item
 */

describe('test item apis', () => {

    let sku1 = new SKU(undefined, "Eurovision 2022 CD", 1, 1, "Fragile!", null, 8.99, 30);
    let sku2 = new SKU(undefined, "Chiara Ferragni's brand water", 1, 1, "$$$", null, 800.99, 1);
    let sku3 = new SKU(undefined, "Watermelon", 1, 1, "The best fruit. Period.", null, 6.11, 5);
    let sku4 = new SKU(undefined, "Banana", 1, 1, "The second best fruit. Period.", null, 1.03, 42);

    const i1 = new Item("Eurovision 2022 CD", 8.99, undefined, 5, 1);;
    const i2 = new Item("Chiara Ferragni's brand water", 800.99, undefined, 5, 2);
    const i3 = new Item("Watermelon", 6.11, undefined, 5, 3);

    // SKUId does not match any SKU
    const i1_invalid = new Item("Krakendice d20", 200, 100000000, 5, 4);
    // supplier does not exist
    const i2_invalid = new Item("Chiara Ferragni's brand water", 800.99, undefined, 1, 5);
    // supplier already sells an item with the same SKU
    const i3_invalid = new Item("Chiara Ferragni's brand SPARKILNG water", 8000.99, undefined, 5, 6);
    // supplier already sells an item with the same ID
    const i4_invalid = new Item("Banana", 8000.99, undefined, 5, 1);

    const newI1 = {
        "newDescription" : "Eurovision 2022 CD (Deluxe Edition)",
        "newPrice" : 10.99
    }
    // price is negative
    const newI1_invalid = {
        "newDescription" : "Eurovision 2022 CD (Deluxe Edition)",
        "newPrice" : -10.99
    }
    

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
        i1.SKUId = sku1.id;
        i2.SKUId = sku2.id;
        i3.SKUId = sku3.id;
        i2_invalid.SKUId = sku2.id;
        i3_invalid.SKUId = sku2.id;
        i4_invalid.SKUId = sku4.id;
        await agent.post('/api/item').send(i1);
        await agent.post('/api/item').send(i2);
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete('/api/items/1');
        await agent.delete('/api/items/2');
        await agent.delete(`/api/skus/${sku1.id}`);
        await agent.delete(`/api/skus/${sku2.id}`);
        await agent.delete(`/api/skus/${sku3.id}`);
        await agent.delete(`/api/skus/${sku4.id}`);
    });

    getAllItems('GET /api/items - retrieve all items in the system', 200, [i1, i2]);
    getItem('GET /api/items/:id - correctly get an item', 200, i1.id, i1);
    getItem('GET /api/items/:id - passing a negative id', 422, -2);
    getItem('GET /api/items/:id - item does not exist', 404, 6);

    addItem('POST /api/item - correctly adding an item', 201, i3);
    addItem('POST /api/item - SKUId does not match any SKU', 404, i1_invalid);
    addItem('POST /api/item - supplier does not exist', 404, i2_invalid);
    addItem('POST /api/item - supplier already sells SKU', 422, i3_invalid);
    addItem('POST /api/item - supplier already sells item', 422, i4_invalid);

    modifyItem('PUT /api/item/:id - correctly modify an item', 200, i1.id, newI1);
    modifyItem('PUT /api/item/:id - item does not exist', 404, 300, newI1);
    modifyItem('PUT /api/item/:id - price is negative', 422, i1.id, newI1_invalid);

    deleteItem('DELETE /api/items/:id - correctly delete an item', 204, i1.id);
    deleteItem('DELETE /api/items/:id - passing a negative id', 422, -2);
    deleteItem('DELETE /api/items/:id - item does not exist', 404, 300);
});


// FR7.1.3.1 List all items
function getAllItems(description, expectedHTTPStatus, items) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/items');
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(items.length);
            let i = 0;
            for (let itm of r.body) {
                itm.id.should.equal(items[i].id);
                itm.description.should.equal(items[i].description);
                itm.price.should.equal(items[i].price);
                itm.SKUId.should.equal(items[i].SKUId);
                itm.supplierId.should.equal(items[i].supplierId);
                i++;
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}


// FR7.1.3.2 Get 1 item
function getItem(description, expectedHTTPStatus, id, item=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/items/${id}`);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                r.body.id.should.equal(item.id);
                r.body.description.should.equal(item.description);
                r.body.price.should.equal(item.price);
                r.body.SKUId.should.equal(item.SKUId);
                r.body.supplierId.should.equal(item.supplierId);
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}


// FR7.1.1 Define a new item
// FR7.1.2 Delete an item
function addItem(description, expectedHTTPStatus, i) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/item').send(i);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the deletions
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/items/${i.id}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR7.1.4 Modify an existing item
function modifyItem(description, expectedHTTPStatus, id, newI) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/item/${id}`).send(newI);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

// FR7.1.2 Delete an item
function deleteItem(description, expectedHTTPStatus, id) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/items/${id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}