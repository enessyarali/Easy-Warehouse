'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const skuitemDBU = require('../database_utilities/skuItemDBU');

const skuitem = require('../model/skuitem');


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

    const db = new skuitemDBU('ezwh.db');
    
    testLoadskuitem(db);
})

//ITEM needs to be uploaded to the db by databaseetup like marco did 
function testLoadskuitem(db){
    test('retrieve all skuitems',async() => {
        var res = await db.loadSKUitem()
        
        expect(res[0].length).to.equal(4);

    })
    
}

describe('Insert SkuItem' , () => {
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

    const db = new skuitemDBU('ezwh.db');
    
    testInsertSKUitem(db);
})


function testInsertSKUitem(db){
    test('Insert a new skuitem', async() => {
        
     await db.insertSKUitem('000',1,'2022/07/07')
        var res = db.loadSKUitem();

        expect(res.length).to.equal(5);
    
    })
}

describe(' Update SkuItem' , () => {
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

    const db = new skuitemDBU('ezwh.db');
    
    
    testUpdateSKUitem(db);
  
})

function testUpdateSKUitem(db){
    test('Update an existing skuitem' , async() => {
        
        await db.updateSKU('123','911','YES','2022/05/05')
        var res =  await db.loadSKUitem();
        expect(res[0].rfid).to.equal('911');
        expect(res[0].isAvailable).to.equal('YES');
        expect(res[0].dateOfStock).to.equal('2022/05/05');

    })

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

    const db = new skuitemDBU('ezwh.db');
    
    testDeleteSKUitem(db);
})


function testDeleteSKUitem(db){
    test('Delete an skuitem' , async() => {
        const rfid = '999'
        await db.deleteSKUitem(rfid)

        var res = await db.loadSKUitem(rfid);
        expect(res.length).to.equal(0); //should return nothing
    }) 
}