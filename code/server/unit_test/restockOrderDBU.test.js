'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const RestockOrderDBU = require('../database_utilities/restockOrderDBU');

const RKO = require('../model/restockOrder');
const ProductRKO = RKO.ProductRKO;

describe('Load Restock Order', () => {
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

    const db = new RestockOrderDBU('ezwh.db');

    testGetRestockOrder(db);
});

function testGetRestockOrder(db) {
    test('retrive all RestockOrder', async () => {
        var res = await db.loadRestockOrder();
        expect(res.length).to.equal(2); //shoudl return 2 RestockOrder
    });

    test('retrive a RestockOrder by Id', async () => {
        var res = await db.loadRestockOrder(1);

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].state).to.equal('ISSUED');
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('descrizione1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].skuItems[0].SKUId).to.equal(1);
        expect(res[0].skuItems[0].rfid).to.equal('123');
    });

    test('retrive RestockOrder by State', async () => {
        var res = await db.loadRestockOrder(undefined, 'ISSUED');

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].state).to.equal('ISSUED');
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('descrizione1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].skuItems[0].SKUId).to.equal(1);
        expect(res[0].skuItems[0].rfid).to.equal('123');
    });

     test('retrive item to return', async () => {
        var res = await db.selectReturnItems(1);

        expect(res[0].SKUId).to.equal(1);
        expect(res[0].rfid).to.equal('123');
    }); 
}

describe('Insert and modify Restock Order', () => {
    //at the start
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
        //removing RestockOrder dependencies to test the insertion
        await dbSet.voidRestockOrder();
    });

    afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new RestockOrderDBU('ezwh.db');

    testInsertRestockOrder(db);
    testUpdateRestockOrderd(db);
    testDeleteRestockOrder(db);
});

function testInsertRestockOrder(db) {
    test('Insert a new Restockb Order', async () => {
        //create new product to insert
        var p = new ProductRKO(1, "descrizione1", 1, 1);
        await db.insertRestockOrder('2022/04/04', p, 5);

        var res = await db.loadRestockOrder();
        //check if the insertion succeded correctly
        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('descrizione1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
    });
}

function testUpdateRestockOrderd(db) {
    var orderId = 1;
    test('Update state of an existing Restock Order', async () => {
        await db.patchRestockOrderState(orderId, 'ISSUED');

        var res = await db.loadRestockOrder(orderId);
        expect(res[0].state).to.equal('ISSUED');
    });

    test('Update skuItem of an existing Restock Order', async () => {
        var si = { rfid: 123, SKUId: 1 };
        await db.patchRestockOrderSkuItems(orderId, si);

        var res = await db.loadRestockOrder(orderId);

        expect(res[0].skuItems[0].SKUId).to.equal(1);
        expect(res[0].skuItems[0].rfid).to.equal('123');
    });

    test('Update transportNote of an existing Restock Order', async () => {
        var tn = { deliveryDate: "2021/12/29" };
        await db.patchRestockOrderTransportNote(orderId, tn);

        var res = await db.loadRestockOrder(orderId);
        expect(JSON.stringify(res[0].transportNote)).to.equal(JSON.stringify(tn)); //to uniform the two object
    });
}

function testDeleteRestockOrder(db) {
    var orderId = 1;
    test('Delete an existing Restock Order', async () => {
        await db.deleteRestockOrder(orderId);
        //try to retrive the just deleted RestockOrder
        var res = await db.loadRestockOrder(orderId);
        expect(res.length).to.equal(0); //should return nothing
    });
}

describe('Test Error of Restock Order', () => {
    beforeAll(async () => {
        await dbSet.resetTable();
        await dbSet.prepareTable();
    });

    afterAll(async () => {
        await dbSet.resetTable();
    });

    const db = new RestockOrderDBU('ezwh.db');

    testInsertWrongRestockOrder(db);
    testUpdateWrongRestockOrderd(db);
    testDeleteRestockOrderWithDependencies(db);
});

function testInsertWrongRestockOrder(db) {
    test('Insert a new wrong Restock Order', async () => {
        var p = new ProductRKO(1, "descrizione1", 1, 1);

        try{
            await db.insertRestockOrder('2022/04/04', p, 4); //wrong supplier
        }
        catch (err){
            expect(err.message).to.equal("Supplier does not exist. Operation aborted.");
        }
    });
}

function testUpdateWrongRestockOrderd(db){
    test('Update skuItem of an existing Restock Order with wrong SKUId', async () => {
        var si = { rfid: 123, SKUId: 5 };
        try{
            await db.patchRestockOrderSkuItems(1, si); //wrong skuId
        }
        catch(err){
            expect(err.message).to.equal("SKUitem does not exist. Operation aborted.");
        }
    });
}

function testDeleteRestockOrderWithDependencies(db){
    test('Delete a Restock Order who has dependencies', async () => {
        try{
            await db.deleteRestockOrder(1); //there is a ReturnOrder that depends on this RestockOrder
        }
        catch(err){
            expect(err.message).to.equal("Dependency detected. Delete aborted.");
        }
    });
}
