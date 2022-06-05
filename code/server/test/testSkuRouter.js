'use strict';

const SKU = require('../model/sku');
const Position = require('../model/position');
const TestDescriptor = require('../model/testDescriptor');
const dbSet = require('../unit_test/dataBaseSetUp');

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

    const position1 = new Position("123456789012", "1234", "5678", "9012", 500, 500, 30, 60);
    const position2 = new Position("123456789013", "1234", "5678", "9013", 500, 500, 8, 4);
    const position3 = new Position("123456789014", "1234", "5678", "9014", 10, 100);

    const sku1 = new SKU(undefined, "Eurovision 2022 CD", 1, 2, "Fragile!", "123456789012", 8.99, 30);
    const sku2 = new SKU(undefined, "Chiara Ferragni's brand water", 2, 1, "$$$", null, 800.99, 4);
    const sku3 = new SKU(undefined, "Watermelon", 11, 1, "The best fruit. Period.", null, 6.11, 5);
    const sku4 = new SKU(undefined, "Banana", 1, 1, "The second best fruit. Period.", null, 1.03, 42);

    const td1 = new TestDescriptor(undefined, "Test descriptor 1", "Look for defects in the bottle", undefined);
    const td2 = new TestDescriptor(undefined, "Test descriptor 2", "Taste the water to make sure it is not poisonous", undefined);

    // Weight and volume must be positive
    const sku1_invalid = new SKU(undefined, "Eurovision 2022 CD", -1, -1, "Fragile!", null, 8.99, 30);
    // Position already occupied
    const sku2_invalid = new SKU(undefined, "Shrek DVD", 2, 1, "Fragile!", "123456789012", 9.99, 20);
    // Position ID not existing
    const sku3_invalid = new SKU(undefined, "White chair", 10, 7, undefined, "123456789015", 20, 10);
    // Exceeding max weight and volume
    const sku4_invalid = new SKU(undefined, "Skyscraper", 200, 300, "Very tall", null, 999.99, 15);

    const newSku1 = {
        "newDescription" : "Eurovision 2022 CD",
        "newWeight" : 1,
        "newVolume" : 2,
        "newNotes" : "Fragile!",
        "newPrice" : 10.99,
        "newAvailableQuantity" : 50
    }
    const newSku1_invalid = {
        "newDescription" : "Eurovision 2022 CD",
        "newWeight" : 1,
        "newVolume" : 2,
        "newNotes" : "Fragile!",
        "newPrice" : 10.99,
        "newAvailableQuantity" : -50
    }
    const newSku2_invalid = {
        "newDescription" : "Eurovision 2022 CD",
        "newWeight" : 1,
        "newVolume" : 2,
        "newNotes" : "Fragile!",
        "newPrice" : 10.99,
        "newAvailableQuantity" : 10000
    }


    // populate the DB
    beforeEach(async () => {
        await dbSet.resetTable();
        await agent.post('/api/sku').send(sku1);
        await agent.post('/api/sku').send(sku2);
        await agent.post('/api/sku').send(sku3);
        const skus = await agent.get('/api/skus');
        for (let s of skus.body) {
            if (s.description=="Eurovision 2022 CD")
                sku1.id = s.id;
            else if (s.description=="Chiara Ferragni's brand water")
                sku2.id = s.id;
            else if (s.description=="Watermelon")
                sku3.id = s.id;
            else if (s.description=="Banana")
                sku4.id = s.id;
        }
        // set all SKU ids
        td1.idSKU = sku2.id;
        td2.idSKU = sku2.id;
        await agent.post('/api/testDescriptor').send(td1);
        await agent.post('/api/testDescriptor').send(td2);
        const tests = await agent.get('/api/testDescriptors');
        for (let t of tests.body) {
            if (t.name=="Test descriptor 1")
                td1.id = t.id;
            else if (t.name=="Test descriptor 2") 
                td2.id = t.id;
        }
        sku2.setTestDescriptors([td1.id, td2.id]);
        await agent.post('/api/position').send(position1);
        await agent.post('/api/position').send(position2);
        await agent.post('/api/position').send(position3);
        await agent.put(`/api/sku/${sku1.id}/position`).send({"position":"123456789012"});

    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/testDescriptor/${td1.id}`);
        await agent.delete(`/api/testDescriptor/${td2.id}`);
        await agent.delete(`/api/skus/${sku1.id}`);
        await agent.delete(`/api/skus/${sku2.id}`);
        await agent.delete(`/api/skus/${sku3.id}`);
        await agent.delete(`/api/position/123456789012`);
        await agent.delete(`/api/position/123456789013`);
        await agent.delete(`/api/position/123456789014`);
    });

    getAllSKUs('GET /api/skus - retrieve all skus in the system', 200, [sku1, sku2, sku3]);
    getSKU('GET /api/skus/:id - correctly get a SKU', 200, null, sku2);
    getSKU('GET /api/skus/:id - passing a negative id', 422, -5);
    getSKU('GET /api/skus/:id - SKU does not exist', 404, 100000000000000);

    addSKU('POST /api/sku - correctly adding a SKU', 201, sku4);
    addSKU('POST /api/sku - wrong inputs for weight and volume', 422, sku1_invalid);

    modifySKU('PUT /api/sku/:id - correctly modify a SKU', 200, newSku1, null, sku1);
    modifySKU('PUT /api/sku/:id - SKU does not exist', 404, newSku1, 1000000000000);
    modifySKU('PUT /api/sku/:id - available quantity is negative', 422, newSku1_invalid, null, sku1);
    modifySKU('PUT /api/sku/:id - position cannot contain weight and volume', 422, newSku2_invalid, null, sku1);

    patchPosition('PUT /api/sku/:id/position - correctly modify position of a SKU', 200, {"position":"123456789013"}, null, sku2, position2);
    patchPosition('PUT /api/sku/:id/position - position does not exist', 404, {"position":"823456789013"}, null, sku3);
    patchPosition('PUT /api/sku/:id/position - position cannot contain weight and volume', 422, {"position":"123456789014"}, null, sku3);
    patchPosition('PUT /api/sku/:id/position - SKU does not exist', 404, {"position":"123456789014"}, 100000000);
    patchPosition('PUT /api/sku/:id/position - position is already occupied', 422, {"position":"123456789012"}, null, sku3);

    deleteSKU('DELETE /api/skus/:id - correctly delete a SKU', 204, null, sku1);
    deleteSKU('DELETE /api/skus/:id - passing a negative id', 422, -2);
    deleteSKU('DELETE /api/skus/:id - SKU does not exist', 404, 10000000);
});


// FR2.3 List all SKUs
function getAllSKUs(description, expectedHTTPStatus, skus) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/skus');
            r.should.have.status(expectedHTTPStatus);
            let i = 0;
            for (let sku of r.body) {
                sku.id.should.equal(skus[i].id);
                sku.description.should.equal(skus[i].description);
                sku.weight.should.equal(skus[i].weight);
                sku.volume.should.equal(skus[i].volume);
                sku.notes.should.equal(skus[i].notes);
                sku.price.should.equal(skus[i].price);
                // position could be null, so we must use a different syntax
                if (skus[i].position===null) {
                    chai.expect(sku.position).to.be.null;
                } else {
                    sku.position.should.equal(skus[i].position);  
                }
                sku.availableQuantity.should.equal(skus[i].availableQuantity);
                checkTestDescriptors(sku, skus[i]);
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
            const r = await agent.get(`/api/skus/${sku ? sku.id : id}`);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                r.body.description.should.equal(sku.description);
                r.body.weight.should.equal(sku.weight);
                r.body.volume.should.equal(sku.volume);
                r.body.notes.should.equal(sku.notes);
                r.body.price.should.equal(sku.price);
                // position could be null, so we must use a different syntax
                if (sku.position===null) {
                    chai.expect(r.body.position).to.be.null;
                } else {
                    r.body.position.should.equal(sku.position);  
                }
                r.body.availableQuantity.should.equal(sku.availableQuantity);
                checkTestDescriptors(r.body, sku);
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

//////////////// utility to check the content of test descriptors ////////////////
function checkTestDescriptors(dbSKU, expectedSKU) {
    let i = 0;
    dbSKU.testDescriptors.length.should.equal(expectedSKU.testDescriptors.length);
    if (expectedSKU.testDescriptors.length!=0) {
        for (let t of dbSKU.testDescriptors) {
            t.should.equal(expectedSKU.testDescriptors[i]);
            i++;
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////


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
                // if the insertion was successful, try the get-deletion
                const skus = await agent.get(`/api/skus`);
                for (let sku of skus.body)
                    if(s.description==sku.description) {
                        s.id = sku.id;
                    }
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
function modifySKU(description, expectedHTTPStatus, newS, id, sku=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/sku/${sku ? sku.id : id}`).send(newS);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

// FR2.1 Modify an existing SKU -> add a position
function patchPosition(description, expectedHTTPStatus, position, id, sku=undefined, posObj=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/sku/${sku ? sku.id : id}/position`).send(position);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rUpdate.status==200) {
                // if the update was successful, test the position
                const pos = await agent.get(`/api/positions`);
                for (let p of pos.body)
                    if(p.positionID==position.position) {
                        p.positionID.should.equal(posObj.positionID);
                        p.aisleID.should.equal(posObj.aisleID);
                        p.row.should.equal(posObj.row);
                        p.col.should.equal(posObj.col);
                        p.maxWeight.should.equal(posObj.maxWeight);
                        p.maxVolume.should.equal(posObj.maxVolume);
                        p.occupiedWeight.should.equal(posObj.occupiedWeight);
                        p.occupiedVolume.should.equal(posObj.occupiedVolume);
                    }
            }
        } catch(err) {console.log(err);}
    });       
}

// FR2.2 Delete a SKU
function deleteSKU(description, expectedHTTPStatus, id, sku=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/skus/${sku ? sku.id : id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}