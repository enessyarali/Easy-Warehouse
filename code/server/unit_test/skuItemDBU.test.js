'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const SkuitemDBU = require('../database_utilities/skuItemDBU');

const Skuitem = require('../model/skuItem');

describe('Load SkuItem ',() => {
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

    const db = new SkuitemDBU('ezwh.db');
    
    testLoadSkuitem(db);
})

//ITEM needs to be uploaded to the db by databaseetup like marco did 
function testLoadSkuitem(db){
    test('Retrieve all SkuItems',async () => {
        var res = await db.loadSKUitem()
        
        expect(res.length).to.equal(4);
    });
    test('Retrieve SkuItem by rfid' , async () => {
        var res = await db.loadSKUitem('123');

        expect(res[0].RFID).to.equal('123');
        expect(res[0].SKUId).to.equal(1);
        expect(res[0].Available).to.equal(0);
        expect(res[0].DateOfStock).to.equal('2022/04/04');
    }); 
    test('Retrieve SkuItem by SKUid' , async () => {
        var res = await db.loadSKUitem(undefined, 2);

        expect(res.length).to.equal(2);
    }); 
    test('Try Clean' , async () => {
        var res = await db.loadSKUitem('123');

        expect(res[0].clean(['RFID']).RFID).to.be.undefined;
    }); 
}

describe('Insert and modify SkuItem' , () => {
    beforeAll( async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB
        await dbSet.prepareTable();
        //removing TestResult dependencies to test the insertion
        await dbSet.voidSkuItem();
    });
    //at the end of all tests in this file
     afterAll( async () => {
        //clear DB at the end
        await dbSet.resetTable();
    }); 

    const db = new SkuitemDBU('ezwh.db');
    
    testInsertSKUitem(db);
    testUpdateSKUitem(db);
})


function testInsertSKUitem(db){
    test('Insert a new SkuItem', async() => {

        await db.insertSKUitem('123', 1, '2022/04/04');
        var res = await db.loadSKUitem();

        expect(res[0].RFID).to.equal('123');
        expect(res[0].SKUId).to.equal(1);
        expect(res[0].Available).to.equal(0);
        expect(res[0].DateOfStock).to.equal('2022/04/04');
    });
}

function testUpdateSKUitem(db){
    test('Update an existing SkuItem' , async() => {
        await db.insertSKUitem('456', 2, '2022/04/04');
        await db.updateSKUitem('456','888',0,'2022/04/05');

        var res =  await db.loadSKUitem('888');
        expect(res[0].RFID).to.equal('888');
        expect(res[0].Available).to.equal(0);
        expect(res[0].DateOfStock).to.equal('2022/04/05');

    });

}

describe('Delete SkuItem' , () => {
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

    const db = new SkuitemDBU('ezwh.db');
    
    testDeleteSKUitem(db);
})

function testDeleteSKUitem(db){
    test('Delete an skuitem' , async() => {
        const rfid = '999';
        await db.deleteSKUitem(rfid);

        var res = await db.loadSKUitem(rfid);
        expect(res.length).to.equal(0); //should return nothing
    }); 
}

describe('Test Error of Sku Item', () => {
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB
        await dbSet.prepareTable();
        await dbSet.createSkuItemDependency();
    });
    //at the end of all tests in this file
     afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    }); 


    const db = new SkuitemDBU('ezwh.db');

    testWrongLoadSKUitem(db);
    testWrongInsertSKUitem(db);
    testWrongDeleteSKUitem(db);
});

function testWrongInsertSKUitem(db){
    test('Insert a new SkuItem with wrong SKUid', async() => {
        try{
            await db.insertSKUitem('123', 9, '2022/04/04'); //1
        }
        catch(err){
            expect(err.message).to.equal("Provided id does not match any SKU");
        }
    });
}

function testWrongDeleteSKUitem(db){
    test('Delete a SkuItem with dependencies', async() => {
        try{
            await db.deleteSKUitem('666');
        }
        catch(err){
            expect(err.message).to.equal("Dependency detected. Delete aborted.");
        }
    });
}

function testWrongLoadSKUitem(db){
    test('Retrieve SkuItem by wrong SKUid' , async () => {
        try{
            await db.loadSKUitem(undefined, 9); //1
        }
        catch(err){
            expect(err.message).to.equal("Provided id does not match any SKU");
        }
    }); 
}