'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const ReturnOrderDBU = require('../database_utilities/returnOrderDBU');

const RTO = require('../model/returnOrder');
const ProductRTO = RTO.ProductRTO;

describe('Load Return Order', () => {
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

    const db = new ReturnOrderDBU('ezwh.db');

    testGetReturnOrder(db);
});

function testGetReturnOrder(db) {

    test('retrive all ReturnOrder', async () => {
        var res = await db.loadReturnOrder();
        expect(res.length).to.equal(2); //shoudl return 2 ReturnOrder
    });

    test('retrive a ReturnOrder by Id', async () => {
        var res = await db.loadReturnOrder(1);
        
        expect(res[0].returnDate).to.equal('2022/04/04');
        expect(res[0].restockOrderId).to.equal(1);
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('desc1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].RFID).to.equal('123');
    });
}

describe('Insert and Modify Return Order', () => {
    //at the start
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
        //removing ReturnOrder dependencies to test the insertion
        await dbSet.voidReturnOrder();
    });

    afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new ReturnOrderDBU('ezwh.db');

    testInsertReturnOrder(db);
    testDeleteReturnOrder(db);
});

function testInsertReturnOrder(db) {
    test('Insert a new Return Order', async () => {
        //create new product to insert
        var p = new ProductRTO(1, 'desc1', 1, '123');
        await db.insertReturnOrder('2022/04/04', p, 1);

        var res = await db.loadReturnOrder(1);
        //check if the insertion succeded correctly
        expect(res[0].returnDate).to.equal('2022/04/04');
        expect(res[0].restockOrderId).to.equal(1);
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('desc1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].RFID).to.equal('123');
    });
}

function testDeleteReturnOrder(db) {
    var orderId = 1;
    test('Delete an existing Return Order', async () => {
        await db.deleteReturnOrder(orderId);
        //try to retrive the just deleted ReturnOrder
        var res = await db.loadReturnOrder(orderId);
        expect(res.length).to.equal(0); //should return nothing
    });
}

describe('Test Error of Return Order', () => {
    beforeAll(async () => {
        await dbSet.resetTable();
        await dbSet.prepareTable();
    });

    afterAll(async () => {
        await dbSet.resetTable();
    });

    const db = new ReturnOrderDBU('ezwh.db');

    testInsertWrongReturnOrder(db);
});

function testInsertWrongReturnOrder(db){
    test('Insert a new wrong Return Order', async () => {
        var p = new ProductRTO(1, 'desc1', 1, '123');

        try{
            await db.insertReturnOrder('2022/04/04', p, 5); //wrong RestockOrder
        }
        catch (err){
            expect(err.message).to.equal("RestockOrder does not exist. Operation aborted.");
        }
    });
}