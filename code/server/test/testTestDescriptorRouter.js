'use strict';

const SKU = require('../model/sku');
const TestDescriptor = require('../model/testDescriptor');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

describe('test test descriptor apis', () => {

    let sku2 = new SKU(undefined, "Chiara Ferragni's brand water", 1, 1, "$$$", null, 800.99, 1);

    const td1 = new TestDescriptor(undefined, "Test descriptor 1", "Look for defects in the bottle", undefined);
    const td2 = new TestDescriptor(undefined, "Test descriptor 2", "Taste the water to make sure it is not poisonous", undefined);

    const new_td = {
        "name":"test descriptor 3",
        "procedureDescription":"Check if the label is correctly printed"
    }

    const new_td_invalid1 = {
        "name":"test descriptor 3",
        "procedureDescription":"Check if the label is correctly printed",
        "idSKU" :999

    }

    const new_td_invalid2 = {
        "name":"test descriptor 3",
        "procedureDescription":"Check if the label is correctly printed",
        "idSKU" :-3

    }

    const updated_td1 = {
        "newName":"test descriptor 1",
        "newProcedureDescription":"Look for defects in the bottle and bottle cap."
    }

    const updated_td_invalid1 = {
        "newName":"test descriptor 1",
        "newProcedureDescription":"Look for defects in the bottle and bottle cap.",
        "newIdSKU" :987
    }

    const updated_td_invalid2 = {
        "newName":"test descriptor 1",
        "newProcedureDescription":"Look for defects in the bottle.",
        "newIdSKU" :"This is not an SKU ID."
    }

    // populate the DB
    beforeEach(async () => {
        await agent.post('/api/sku').send(sku2);
        const skus = await agent.get('/api/skus');
        sku2 = skus.body[0];
        // set all SKU ids
        td1.idSKU = sku2.id;
        td2.idSKU = sku2.id;
        new_td.idSKU = sku2.id;
        updated_td1.newIdSKU = sku2.id;
        await agent.post('/api/testDescriptor').send(td1);
        await agent.post('/api/testDescriptor').send(td2);
        const tests = await agent.get('/api/testDescriptors');
        for (let t of tests.body) {
            if (t.name=="Test descriptor 1")
                td1.id = t.id;
            else if (t.name=="Test descriptor 2") 
                td2.id = t.id;
        }
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/testDescriptor/${td1.id}`);
        await agent.delete(`/api/testDescriptor/${td2.id}`);
        await agent.delete(`/api/skus/${sku2.id}`);
    });

    getAllTestDescriptors('GET /api/testDescriptors - retrieve all test descriptors', 200, [td1, td2]);

    getTestDescriptor('GET /api/testDescriptors/:id - retrieve a test descriptor given its id', 200, null, td1);
    getTestDescriptor('GET /api/testDescriptors/:id - test descriptor does not exist', 404, 789);
    getTestDescriptor('GET /api/testDescriptors/:id - id is equal to 0', 422, 0);

    addTestDescriptor('POST /api/testDescriptor - correctly adding a test descriptor', 201, new_td);
    addTestDescriptor('POST /api/testDescriptor - idSKU not found', 404, new_td_invalid1);
    addTestDescriptor('POST /api/testDescriptor - invalid idSKU', 422, new_td_invalid2);

    modifyTestDescriptor('PUT /api/testDescriptor/:id - correctly modify a test descriptor', 200, updated_td1, null, td1);
    modifyTestDescriptor('PUT /api/testDescriptor/:id - test descriptor does not exist', 404, updated_td1, 1000000);
    modifyTestDescriptor('PUT /api/testDescriptor/:id - no sku associated to given idSKU', 404, updated_td_invalid1, null, td1);
    modifyTestDescriptor('PUT /api/testDescriptor/:id - negative test descriptor id', 422, updated_td1, -2);
    modifyTestDescriptor('PUT /api/testDescriptor/:id - sku id is not a number', 422, null, updated_td_invalid2);

    deleteTestDescriptor('DELETE /api/testDescriptor/:id - correctly delete a test descriptor', 204, null, td1);
    deleteTestDescriptor('DELETE /api/testDescriptor/:id - invalid test descriptor id', 422, "notAnID");
    deleteTestDescriptor('DELETE /api/testDescriptor/:id - test descriptor does not exist', 404, 1000000);
});

function getAllTestDescriptors(description, expectedHTTPStatus, results) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/testDescriptors`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if (results.length!=0 && r.status==200) {
                r.body.length.should.equal(results.length);
                let i = 0;
                for (let res of r.body) {
                    res.id.should.equal(results[i].id);
                    res.name.should.equal(results[i].name);
                    res.procedureDescription.should.equal(results[i].procedureDescription);
                    res.idSKU.should.equal(results[i].idSKU);
                    i++;
                }
            }
        } catch(err) {console.log(err);}
    });       
}

function getTestDescriptor(description, expectedHTTPStatus, id, result=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/testDescriptors/${result ? result.id : id}`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if (r.status==200) {
                r.body.id.should.equal(result.id);
                r.body.name.should.equal(result.name);
                r.body.procedureDescription.should.equal(result.procedureDescription);
                r.body.idSKU.should.equal(result.idSKU);
            }
        } catch(err) {console.log(err);}
    });       
}

function addTestDescriptor(description, expectedHTTPStatus, result) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/testDescriptor').send(result);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the get-deletion
                const res = await agent.get(`/api/testDescriptors`);
                for (let r of res.body)
                    if(r.description==result.description) {
                        result.id = r.id;
                    }
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/testDescriptor/${result.id}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

function modifyTestDescriptor(description, expectedHTTPStatus, newTD, id, result=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/testDescriptor/${result ? result.id : id}`).send(newTD);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

function deleteTestDescriptor(description, expectedHTTPStatus, id, result=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/testDescriptor/${result ? result.id : id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}