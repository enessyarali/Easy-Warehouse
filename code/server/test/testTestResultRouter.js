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
 *  FR3.2 Manage quality tests
 *       FR3.0.1 List all quality tests for a given sku item
 *       FR3.0.2 Get only 1 quality test for a given sku item
 *       FR3.2.1 Add a quality test
 *       FR3.2.2 Modify a quality test
 *       FR3.2.3 Delete a quality test
 */

describe('test test result apis', () => {

    let sku2 = new SKU(undefined, "Chiara Ferragni's brand water", 1, 1, "$$$", null, 800.99, 1);

    const si2 = new SkuItem("12345678901234567890123456789016", undefined, 0, null);

    const td1 = new TestDescriptor(undefined, "Test descriptor 1", "Look for defects in the bottle", undefined);
    const td2 = new TestDescriptor(undefined, "Test descriptor 2", "Taste the water to make sure it is not poisonous", undefined);

    // test results on si2
    const tr1 = new TestResult(undefined, undefined, "2022/05/21", false);
    tr1.rfid = "12345678901234567890123456789016";
    const tr2 = new TestResult(undefined, undefined, "2022/05/21", true);
    tr2.rfid = "12345678901234567890123456789016";

    // result is not boolean
    const tr1_invalid = new TestResult(undefined, undefined, "2022/05/21", "SOMETHING");
    tr1_invalid.rfid = "12345678901234567890123456789016";
    // sku item does not exist
    const tr2_invalid = new TestResult(undefined, undefined, "2022/05/21", false);
    tr2_invalid.rfid = "12345678901234567890123456789017";
    // test descriptor does not exist
    const tr3_invalid = new TestResult(undefined, 10000000000, "2022/05/21", false);
    tr3_invalid.rfid = "12345678901234567890123456789016";
    // sku item is too short
    const tr4_invalid = new TestResult(undefined, undefined, "2022/05/21", false);
    tr4_invalid.rfid = "1234567890123456789013456789016";

    const newTR1 = {
        "newIdTestDescriptor": undefined,
        "newDate":"2021/11/28",
        "newResult": true
    }
    // test descriptor does not exist
    const newTR1_invalid = {
        "newIdTestDescriptor": 1000000,
        "newDate":"2021/11/28",
        "newResult": true
    }
    // wrong date format
    const newTR2_invalid = {
        "newIdTestDescriptor": undefined,
        "newDate":"2021-11-28",
        "newResult": true
    }


    // populate the DB
    beforeEach(async () => {
        await dbSet.resetTable();
        await agent.post('/api/sku').send(sku2);
        const skus = await agent.get('/api/skus');
        sku2 = skus.body[0];
        // set all SKU ids
        si2.SKUId = sku2.id;
        td1.idSKU = sku2.id;
        td2.idSKU = sku2.id;
        await agent.post('/api/skuitem').send(si2);
        await agent.post('/api/testDescriptor').send(td1);
        await agent.post('/api/testDescriptor').send(td2);
        const tests = await agent.get('/api/testDescriptors');
        for (let t of tests.body) {
            if (t.name=="Test descriptor 1")
                td1.id = t.id;
            else if (t.name=="Test descriptor 2") 
                td2.id = t.id;
        }
        tr1.idTestDescriptor = td1.id;
        tr2.idTestDescriptor = td2.id;
        tr1_invalid.idTestDescriptor = td2.id;
        tr2_invalid.idTestDescriptor = td2.id;
        tr4_invalid.idTestDescriptor = td2.id;
        newTR1.newIdTestDescriptor = td2.id;
        newTR2_invalid.newIdTestDescriptor = td2.id;
        await agent.post('/api/skuitems/testResult').send(tr1);
        await agent.post('/api/skuitems/testResult').send(tr2);
        const resultsSi2 = await agent.get('/api/skuitems/12345678901234567890123456789016/testResults');
        tr1.id = resultsSi2.body[0].id;
        tr2.id = resultsSi2.body[1].id;
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/skuitems/12345678901234567890123456789016/testResult/${tr1.id}`);
        await agent.delete(`/api/skuitems/12345678901234567890123456789016/testResult/${tr2.id}`);
        await agent.delete(`/api/testDescriptor/${td1.id}`);
        await agent.delete(`/api/testDescriptor/${td2.id}`);
        await agent.delete('/api/skuitems/12345678901234567890123456789016');
        await agent.delete(`/api/skus/${sku2.id}`);
    });

    getAllTestResults('GET /api/skuitems/:rfid/testResults - retrieve all test results for a given sku item in the system', 200, "12345678901234567890123456789016", [tr1, tr2]);
    getAllTestResults('GET /api/skuitems/:rfid/testResults - RFID is too short', 422, "1234567890123456789012345789016", [tr1, tr2]);
    getAllTestResults('GET /api/skuitems/:rfid/testResults - sku item does not exist', 404, "12345678901234567890123456789017", [tr1, tr2]);

    getTestResult('GET /api/skuitems/:rfid/testResults/:id - correctly get a test result', 200, "12345678901234567890123456789016", null, tr1);
    getTestResult('GET /api/skuitems/:rfid/testResults/:id - RFID is too short', 422, "1234567890123456789012345789016", null, tr1);
    getTestResult('GET /api/skuitems/:rfid/testResults/:id - sku item does not exist', 404, "12345678901234567890123456789017", null, tr1);
    getTestResult('GET /api/skuitems/:rfid/testResults/:id - test result does not exist', 404, "12345678901234567890123456789016", 1000000000);

    //addTestResult('POST /api/skuitems/testResult - correctly adding a test result', 201, tr2);
    addTestResult('POST /api/skuitems/testResult - result is not boolean', 422, tr1_invalid);
    addTestResult('POST /api/skuitems/testResult - sku item does not exist', 404, tr2_invalid);
    addTestResult('POST /api/skuitems/testResult - test descriptor does not exist', 404, tr3_invalid);
    addTestResult('POST /api/skuitems/testResult - sku item is too short', 422, tr4_invalid);
    
    modifyTestResult('PUT /api/skuitems/:rfid/testResult/:id - correctly modify a test result', 200, newTR1, "12345678901234567890123456789016", null, tr1);
    modifyTestResult('PUT /api/skuitems/:rfid/testResult/:id - new test descriptor does not exist', 404, newTR1_invalid, "12345678901234567890123456789016", null, tr1);
    modifyTestResult('PUT /api/skuitems/:rfid/testResult/:id - sku item does not exist', 404, newTR1, "12345678901234567890123456789017", null, tr1);
    modifyTestResult('PUT /api/skuitems/:rfid/testResult/:id - test result does not exist', 404, newTR1, "12345678901234567890123456789016", 1000000000);
    modifyTestResult('PUT /api/skuitems/:rfid/testResult/:id - wrong date format', 422, newTR2_invalid, "12345678901234567890123456789016", null, tr1);

    deleteTestResult('DELETE /api/skuitems/:rfid/testResult/:id - correctly delete a test result', 204, "12345678901234567890123456789016", null, tr1);
    deleteTestResult('DELETE /api/skuitems/:rfid/testResult/:id - RFID has an alphabetic character', 422, "123456789012345c7890123456789016", null, tr1);
    deleteTestResult('DELETE /api/skuitems/:rfid/testResult/:id - sku item does not exist', 404, "12345678901234567890123456789017", null, tr1);
});

// FR3.0.1 List all quality tests for a given sku item
function getAllTestResults(description, expectedHTTPStatus, rfid, results) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/skuitems/${rfid}/testResults`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if (results.length!=0 && r.status==200) {
                r.body.length.should.equal(results.length);
                let i = 0;
                for (let res of r.body) {
                    res.id.should.equal(results[i].id);
                    res.idTestDescriptor.should.equal(results[i].idTestDescriptor);
                    res.Date.should.equal(results[i].Date);
                    res.Result.should.equal(results[i].Result);
                    i++;
                }
            }
        } catch(err) {console.log(err);}
    });       
}

// FR3.0.2 Get only 1 quality test for a given sku item
function getTestResult(description, expectedHTTPStatus, rfid, id, result=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/skuitems/${rfid}/testResults/${result ? result.id : id}`);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            r.should.have.status(expectedHTTPStatus);
            if (r.status==200) {
                r.body.id.should.equal(result.id);
                r.body.idTestDescriptor.should.equal(result.idTestDescriptor);
                r.body.Date.should.equal(result.Date);
                r.body.Result.should.equal(result.Result);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR3.2.1 Add a quality test
// FR3.2.3 Delete a quality test
function addTestResult(description, expectedHTTPStatus, result) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/skuitems/testResult').send(result);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the get-deletion
                const res = await agent.get(`/api/skuitems/${result.rfid}/testResults`);
                for (let r of res.body)
                    if(r.Date==result.Date) {
                        result.id = r.id;
                    }
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/skuitems/${result.rfid}/testResult/${result.id}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR3.2.2 Modify a quality test
function modifyTestResult(description, expectedHTTPStatus, newTR, rfid, id, result=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/skuitems/${rfid}/testResult/${result ? result.id : id}`).send(newTR);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}


// FR3.2.3 Delete a quality test
function deleteTestResult(description, expectedHTTPStatus, rfid, id, result=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/skuitems/${rfid}/testResult/${result ? result.id : id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}