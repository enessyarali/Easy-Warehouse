'use strict';

const SKUItem = require('../model/skuItem');
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
 * FR5.8.3 Store a SKU item
 * FR6.10 Remove a SKU item from warehouse
 */

describe('test sku item apis', () => {

    let sku1 = new SKU(1, "Eurovision 2022 CD", 1, 1, "Fragile!", null, 8.99, 30);
    let sku2 = new SKU(2, "Chiara Ferragni's brand water", 1, 1, "$$$", null, 800.99, 1);

    const si1 = new SKUItem("12345678901234567890123456789016", 1, 1, "2022/05/22 09:30"); 
    const si2 = new SKUItem("12345678901234567890123456789017", 2, 0, "2021/12/30");

    const newSi1 = new SKUItem("12345678901234567890123456789018", 2, undefined, undefined);
    const newSi2 = {
        "newRFID":"12345678901234567890123456789016",
        "newAvailable":1,
        "newDateOfStock":"2022/05/22 09:30"
    };

    const newSi_invalid1 = {
        "RFID":"12345678901234567890123456789019",
        "SKUId":999
    };
    const newSi_invalid2 = {
        "RFID":"Why are you reading this?",
        "SKUId":"Roses are red, violets are blue,",
        "DateOfStock":"Let's watch together scooby-doo!"
    };
    const newSi_invalid3 = {
        "newRFID":"Black",
        "newAvailable":"White",
        "newDateOfStock":"Ringo"
    };

    // populate the DB
    beforeEach(async () => {
        await dbSet.resetTable();
        await agent.post('/api/sku').send(sku1);
        await agent.post('/api/sku').send(sku2);
        await agent.post('/api/skuitem').send(si1);
        await agent.post('/api/skuitem').send(si2);
        await agent.put(`/api/skuitems/12345678901234567890123456789016`).send(newSi2);
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete('/api/skuitems/12345678901234567890123456789016');
        await agent.delete('/api/skuitems/12345678901234567890123456789017');
        await agent.delete(`/api/skus/1`);
        await agent.delete(`/api/skus/2`);
    });

    getAllSKUItems('GET /api/skuitems - retrieve all sku items in the system', 200, [si1, si2]);

    getSKUItemsBySKUId('GET /api/skuitems/sku/:id - retrieve all available sku items with matching id', 200, si1.SKUId, [si1]);
    getSKUItemsBySKUId('GET /api/skuitems/sku/:id - wrong sku id', 422, 'araAra');
    getSKUItemsBySKUId('GET /api/skuitems/sku/:id - unexisting sku', 404, 900);

    getSKUItem('GET /api/skuitems/:rfid - correctly retrieve the sku item with matching rfid', 200, si2.RFID, si2);
    getSKUItem('GET /api/skuitems/:rfid - unexisting rfid', 404, '10000000000000000000000000000001');
    getSKUItem('GET /api/skuitems/:rfid - wrong rfid', 422, 'siuuuuuuuuuuuuuuuuuuuuuuuuuum');

    addSKUItem('POST /api/skuitem/ - correctly add a sku item', 201, newSi1);
    addSKUItem('POST /api/skuitem/ - unexisting sku with matching sku id', 404, newSi_invalid1);
    addSKUItem('POST /api/skuitem/ - wrong sku item data', 422, newSi_invalid2);

    modifySKUItem('PUT /api/skuitems/:rfid - correctly modify a sku item', 200, si1.RFID, newSi2);
    modifySKUItem('PUT /api/skuitems/:rfid - unexisting sku item', 404, "12345678901234567890999999999999", newSi2);
    modifySKUItem('PUT /api/skuitems/:rfid - wrong rfid', 422, "Subwoolfer", newSi2);
    modifySKUItem('PUT /api/skuitems/:rfid - wrong sku item data', 422, si1.RFID, newSi_invalid3);

    deleteSKUItem('DELETE /api/skuitems/:rfid - correctly delete a sku item', 204, si1.RFID);
    deleteSKUItem('DELETE /api/skuitems/:rfid - wrong rfid', 422, "Raffaello-Donatello-Michelangelo-Leonardo");
});

function getAllSKUItems(description, expectedHTTPStatus, sis) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/skuitems');
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(sis.length);
            let i = 0;
            for (let si of r.body) {
                si.RFID.should.equal(sis[i].RFID);
                si.SKUId.should.equal(sis[i].SKUId);
                si.Available.should.equal(sis[i].Available);
                si.DateOfStock.should.equal(sis[i].DateOfStock);
                i++;
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

function getSKUItemsBySKUId(description, expectedHTTPStatus, id, sis=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/skuitems/sku/${id}`);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                r.body.length.should.equal(sis.length)
                let i = 0;
                for (let si of r.body) {
                    si.RFID.should.equal(sis[i].RFID);
                    si.SKUId.should.equal(sis[i].SKUId);
                    si.DateOfStock.should.equal(sis[i].DateOfStock);
                    i++;
                }
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

function getSKUItem(description, expectedHTTPStatus, rfid, si=undefined) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get(`/api/skuitems/${rfid}`);
            r.should.have.status(expectedHTTPStatus);
            if(r.status == 200) {
                r.body.RFID.should.equal(si.RFID);
                r.body.SKUId.should.equal(si.SKUId);
                r.body.Available.should.equal(si.Available);
                r.body.DateOfStock.should.equal(si.DateOfStock);
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

function addSKUItem(description, expectedHTTPStatus, si) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/skuitem').send(si);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the deletion
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/skuitems/${si.RFID}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

function modifySKUItem(description, expectedHTTPStatus, rfid, newSi) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/skuitems/${rfid}`).send(newSi);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

function deleteSKUItem(description, expectedHTTPStatus, rfid) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/skuitems/${rfid}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}