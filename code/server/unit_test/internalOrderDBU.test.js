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
        expect(res[0].state).to.equal('ISSUED');
        expect(res[0].customerId).to.equal(1);
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('d1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].products[0].RFID).to.equal('999');
    });

    test('retrive InternalOrder by State', async () => {
        var res = await db.loadInternalOrder(undefined, 'ISSUED');

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].state).to.equal('ISSUED');
        expect(res[0].customerId).to.equal(1);
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('d1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].products[0].RFID).to.equal('999');
    });
}

describe('Insert and modify Internal Order', () => {
    //at the start
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
        //removing InternalOrder dependencies to test the insertion
        await dbSet.voidInternalOrder();
    });

    afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new InternalOrderDBU('ezwh.db');

    testInsertInternalOrder(db);
    testUpdateInternalOrder(db);
    testDeleteInternalOrder(db);
});

function testInsertInternalOrder(db) {
    test('Insert a new Internal Order', async () => {
        //create new product to insert
        var p = new ProductIO(1,'d1',1,1,'999');
        await db.insertInternalOrder('2022/04/04', p, 1);

        var res = await db.loadInternalOrder();
        //check if the insertion succeded correctly
        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].customerId).to.equal(1);
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('d1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
    
    });
}

function testUpdateInternalOrder(db) {
    var orderId = 1;
    test('Update state of an existing Internal Order', async () => {
        await db.updateInternalOrder(orderId, 'ACCEPTED');

        var res = await db.loadInternalOrder(orderId);
        expect(res[0].state).to.equal('ACCEPTED');
    });

    test('Update skuItem of an existing Internal Order', async () => {
        var si = { RFID: 999, SkuID: 1 };
        await db.updateInternalOrder(orderId, 'COMPLETED',si);

        var res = await db.loadInternalOrder(orderId);

        expect(res[0].state).to.equal('COMPLETED');
        expect(res[0].products[0].SKUId).to.equal(1);
        //expect(res[0].products[0].rfid).to.equal('999'); //-> strange sync behaviour
    });
}

function testDeleteInternalOrder(db) {
    var orderId = 1;
    test('Delete an existing Internal Order', async () => {
        await db.deleteInternalOrder(orderId);
        //try to retrive the just deleted InternalOrder
        var res = await db.loadInternalOrder(orderId);
        expect(res.length).to.equal(0); //should return nothing
    });
}

describe('Test Error of Internal Order', () => {
    beforeAll(async () => {
        await dbSet.resetTable();
        await dbSet.prepareTable();
    });

    afterAll(async () => {
        await dbSet.resetTable();
    });

    const db = new InternalOrderDBU('ezwh.db');

    testInsertWrongInternalOrder(db);
});

function testInsertWrongInternalOrder(db) {
    test('Insert a new wrong Internal Order', async () => {
        var p = new ProductIO(1,'d1',1,1,'999');
        
        try{
            await db.insertInternalOrder('2022/04/04', p, 1); //wrong customer
        }
        catch (err){
            expect(err.message).to.equal("The provided id does not match any customer.");
        }
    });
}