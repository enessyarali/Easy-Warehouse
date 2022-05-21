'use strict';

const SKU = require('../model/sku');
const Position = require('../model/position');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

/* FUNCTIONAL REQUIREMENTS
 * 
 * FR2 Manage SKU
 *   FR2.1 Define a new SKU, or modify an existing SKU
 *   FR2.2 Delete a SKU
 *   FR2.3 List all SKUs
 *   FR2.4 Search a SKU (by ID, by description)
 */

describe('test SKU apis', () => {

    const position1 = new Position("123456789012", "1234", "5678", "9012", 500, 500);
    const position2 = new Position("123456789013", "1234", "5678", "9013", 500, 500);
    const position3 = new Position("123456789014", "1234", "5678", "9014", 100, 100);

    const sku1 = new SKU(1, "Eurovision 2022 CD", 1, 1, "Fragile!", "123456789012", 8.99, 30);
    const sku2 = new SKU(2, "Chiara Ferragni's brand water", 1, 1, "$$$", "123456789013", 800.99, 1);
    const sku3 = new SKU(3, "Watermelon", 1, 1, "The best fruit. Period.", null, 6.11, 5);
    const sku4 = new SKU(4, "Banana", 1, 1, "The second best fruit. Period.", null, 1.03, 42);

    // Weight and volume must be positive
    const sku1_invalid = new SKU(undefined, "Eurovision 2022 CD", -1, -1, "Fragile!", null, 8.99, 30);
    // Position already occupied
    const sku2_invalid = new SKU(undefined, "Shrek DVD", 2, 1, "Fragile!", "123456789012", 9.99, 20);
    // Position ID not existing
    const sku3_invalid = new SKU(undefined, "White chair", 10, 7, undefined, "123456789015", 20, 10);
    // Exceeding max weight and volume
    const sku4_invalid = new SKU(undefined, "Skyscraper", 200, 300, "Very tall", null, 999.99, 15);

    const newSku1 = {
        newPrice: 18.99
    }
    const newSku1_invalid = {
        newAvailableQuantity: -23
    }
    const newSku2 = {
        newPosition: "123456789014"
    }
    const newSku2_invalid = {
        newPosition: "123456789000"
    }

    // populate the DB
    beforeEach(async () => {
        await agent.post('/api/position').send(position1);
        await agent.post('/api/position').send(position2);
        await agent.post('/api/position').send(position3);

        await agent.post('/api/sku').send(sku1);
        await agent.post('/api/sku').send(sku2);
        await agent.post('/api/sku').send(sku3);
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/skus/1`);
        await agent.delete(`/api/skus/2`);
        await agent.delete(`/api/skus/3`);
        await agent.delete(`/api/postion/123456789012`);
        await agent.delete(`/api/postion/123456789013`);
        await agent.delete(`/api/postion/123456789014`);
    });

    getAllSKUs('GET /api/skus - retrieve all skus in the system', 200, [sku1, sku2, sku3]);
    getSKU('GET /api/skus/:id - correctly get a SKU', 200, sku1.id, sku1);
    getSKU('GET /api/skus/:id - passing a negative id', 422, -5);
    getSKU('GET /api/skus/:id - SKU does not exist', 404, 58);

    addSKU('POST /api/sku - correctly adding a SKU', 201, sku4);
    addSKU('POST /api/sku - wrong inputs for weight and volume', 422, sku1_invalid);
    addSKU('POST /api/sku - position is already occupied', 422, sku2_invalid);
    addSKU('POST /api/sku - no position with given ID', 422, sku3_invalid);
    addSKU('POST /api/sku - position cannot contain weight and volume', 422, sku4_invalid);

    modifySKU('PUT /api/sku/:id - correctly modify a SKU', 200, sku1.id, newSku1);
    modifySKU('PUT /api/sku/:id - SKU does not exist', 404, 234, newSku1);
    modifySKU('PUT /api/sku/:id - available quantity is negative', 422, sku1.id, newSku1_invalid);
    modifySKU('PUT /api/sku/:id/position - correctly modify position of a SKU', 200, sku2.id, newSku2);
    modifySKU('PUT /api/sku/:id/position - SKU does not exist', 404, 432, newSku2);
    modifySKU('PUT /api/sku/:id/position - position does not exist', 422, sku2.id, newSku2_invalid);

    deleteSKU('DELETE /api/skus/:id - correctly delete a SKU', 204, sku1.id);
    deleteSKU('DELETE /api/skus/:id - passing a negative id', 422, -2);
    deleteSKU('DELETE /api/skus/:id - SKU does not exist', 404, 456);
});


// FR2.3 List all SKUs
function getAllSKUs(description, expectedHTTPStatus, skus) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/skus');
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(skus.length);
            let i = 0;
            for (let sku of r.body) {
                sku.id.should.equal(skus[i].id);
                sku.description.should.equal(skus[i].description);
                sku.weight.should.equal(skus[i].weight);
                sku.volume.should.equal(skus[i].volume);
                sku.notes.should.equal(skus[i].notes);
                sku.price.should.equal(skus[i].price);
                sku.position.should.equal(skus[i].position);
                sku.availableQuantity.should.equal(skus[i].availableQuantity);
                i++;
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}


// FR2.4 Get 1 SKU by id or description
function getSKU(description, expectedHTTPStatus, id, sku=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/skus/${id}`);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                r.body.id.should.equal(sku.id);
                r.body.description.should.equal(sku.description);
                r.body.weight.should.equal(sku.weight);
                r.body.volume.should.equal(sku.volume);
                r.body.notes.should.equal(sku.notes);
                r.body.price.should.equal(sku.price);
                r.body.position.should.equal(sku.position);
                r.body.availableQuantity.should.equal(sku.availableQuantity);
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}


// FR2.1 Define a new SKU
function addSKU(description, expectedHTTPStatus, s) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/sku').send(s);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the deletions
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/skus/${s.id}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR2.1 Modify an existing SKU
function modifySKU(description, expectedHTTPStatus, id, newS) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/sku/${id}`).send(newS);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

// FR2.2 Delete a SKU
function deleteSKU(description, expectedHTTPStatus, id) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/skus/${id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}