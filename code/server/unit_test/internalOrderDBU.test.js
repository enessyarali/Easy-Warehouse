'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const InternalOrderDBU = require('../database_utilities/internalOrderDBU');

const IO = require('../model/internalOrder');
const ProductIO = IO.ProductIO;

describe('Load Internal Order', () => {
    //at the start
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB
        await dbSet.prepareTable();
    });
    //at the end of all tests in this file
     afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    }); 

    const db = new InternalOrderDBU('ezwh.db');

    testGetInternalOrder(db);
});

function testGetInternalOrder(db) {
    test('retrive all InternalOrder', async () => {
        var res = await db.loadInternalOrder();
        expect(res.length).to.equal(2); //should return 2 InternalOrder
    });

    test('retrive an InternalOrder by Id', async () => {
        var res = await db.loadInternalOrder(1);

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].state).to.equal('COMPLETED');
        expect(res[0].customerId).to.equal(1);
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('d1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].products[0].RFID).to.equal('000');
    });

    test('retrive InternalOrder by State', async () => {
        var res = await db.loadInternalOrder(undefined, 'COMPLETED');

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].state).to.equal('COMPLETED');
        expect(res[0].customerId).to.equal(1);
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('d1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].products[0].RFID).to.equal('000');
    });
}