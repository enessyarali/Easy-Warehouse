'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const ItemDBU = require('../database_utilities/itemDBU');

describe('Load Item', () => {
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

    const db = new ItemDBU('ezwh.db');

    testGetItem(db);
});

function testGetItem(db) {
    test('retrieve all Items', async () => {
        var res = await db.loadItem();
        expect(res.length).to.equal(2); //should return 2 Items
    });

    test('retrieve an Item by Id', async () => {
        var res = await db.loadItem(1);

        expect(res[0].id).to.equal(1);
        expect(res[0].description).to.equal('dI1');
        expect(res[0].price).to.equal(1);
        expect(res[0].SKUId).to.equal(1);
        expect(res[0].supplierId).to.equal(5);
    });
}

describe('Insert and modify Item', () => {
    //at the start
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
        //removing TestResult dependencies to test the insertion
        await dbSet.voidItem();
    });

    afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new ItemDBU('ezwh.db');

    testInsertItem(db);
    testUpdateItem(db);
});

function testInsertItem(db) {
    test('Insert a new Item', async () => {
        await db.insertItem(1, 'dI1', 1, 1, 5);
        var res = await db.loadItem(1);

        //check if the insertion succeded correctly
        expect(res[0].id).to.equal(1);
        expect(res[0].description).to.equal('dI1');
        expect(res[0].price).to.equal(1);
        expect(res[0].SKUId).to.equal(1);
        expect(res[0].supplierId).to.equal(5);
    });
}

function testUpdateItem(db) {
    test('Update an existing Item', async () => {
        await db.insertItem(2, 'dI2', 1, 2, 5);
        await db.updateItem(2, 'testItem', 2);
        var res = await db.loadItem(2);

        expect(res[0].id).to.equal(2);
        expect(res[0].description).to.equal('testItem');
        expect(res[0].price).to.equal(2);
    });
}

describe('Delete Item', () => {
    //at the start
    beforeEach(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
    });

    afterEach(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new ItemDBU('ezwh.db');

    testDeleteItemById(db);
    testDeleteItemBySupplier(db);
    testDeleteItemBySKU(db);
});

function testDeleteItemById(db) {
    test('Delete an existing Item given its Id', async () => {
        await db.deleteItem(1);
        //try to retrive the just deleted Item
        var res = await db.loadItem(1);
        expect(res.length).to.equal(0); //should return nothing
    });
}

function testDeleteItemBySupplier(db) {
    test('Delete existing Items given the supplierId', async () => {
        await db.deleteItem(undefined, 5, undefined);
        //try to retrive the just deleted Item
        var res = await db.loadItem();
        expect(res.length).to.equal(0); //should return nothing
    });
}

function testDeleteItemBySKU(db) {
    test('Delete existing Items given the SKUId', async () => {
        await db.deleteItem(undefined, undefined, 2);
        //try to retrive the just deleted Item
        var res = await db.loadItem();
        expect(res.length).to.equal(1); //should return nothing
    });
}

describe('Test Error of Item', () => {
    beforeAll(async () => {
        await dbSet.resetTable();
        await dbSet.prepareTable();
    });

    afterAll(async () => {
        await dbSet.resetTable();
    });

    const db = new ItemDBU('ezwh.db');

    testWrongItemInsert(db);
    testWrongItemDelete(db);

});

function testWrongItemInsert(db) {
    test('Test insertItem with wrong SupplierId ', async () => {

        try {
            await db.insertItem(1, 'dI1', 1, 1, 9); //5
        }
        catch (err) {
            expect(err.message).to.equal("Supplier does not exist. Operation aborted.");
        }
    });
    test('Test insertItem with wrong SKUId ', async () => {

        try {
            await db.insertItem(1, 'dI1', 1, 9, 5); //1
        }
        catch (err) {
            expect(err.message).to.equal("SKU does not exist. Operation aborted.");
        }
    });
    test('Test insertItem with already existing Item ', async () => {
        try {
            await db.insertItem(4, 'dI1', 1, 1, 5);
            await db.insertItem(4, 'dI1', 1, 1, 5);
        }
        catch (err) {
            expect(err.message).to.equal("Supplier already sells SKU / item. Operation aborted.");
        }
    });
}

function testWrongItemDelete(db){
    test('Test deleteItem without arguments ', async () => {

        try {
            await db.deleteItem();
        }
        catch (err) {
            expect(err.message).to.equal("No Argument Passed");
        }
    });
}
