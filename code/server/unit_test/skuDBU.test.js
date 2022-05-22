'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const skuDBU = require('../database_utilities/skuDBU');

const sku = require('../model/sku');


describe('Load SKU', () => {
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

    const db = new skuDBU('ezwh.db');

    testGetskuDBU(db);
});


function testGetskuDBU(db){
    test('retrieve all sku', async () => {
        var res = await db.loadSKU()
        expect(res.lenght).to.equal()
    } )

    
}

describe('Insert and Modify SKU', () =>{
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
        //removing InternalOrder dependencies to test the insertion
    });

    afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new skuDBU('ezwh.db');

    testInsertSKU(db);
    testUpdateSKU(db);
    testDeleteSKU(db);
})

function testInsertSKU(db){
 test('Insert a new SKU', async() => {
   
    //Create new sku to insert
    var s = new sku(1,'newest sku',10,10,'brandnew',5,5,5)
    await db.insertSKU(s)

    var res = await db.loadSKU();
    //check if insertion succeded correctly 
    expect(res[0].id).to.equal(1)
    expect(res[0].description).to.equal('newest sku')
    expect(res[0].weight).to.equal(10)
    expect(res[0].volume).to.equal(10)
    expect(res[0].notes).to.equal('brandnew')
    expect(res[0].price).to.equal(5)
    expect(res[0].position).to.equal(5)
    expect(res[0].availableQuantity).to.equal(5)
    
 })

}

function testUpdateSKU(db){
    test('Update a existing SKU', async() => {

    var s = new sku(1,'newest sku',10,10,'brandnew',5,5,5)
    await db.insertSKU(s)
    var  up = new sku(1,'oldsku',20,20,'old',6,6,6)
    await db.updateSKU(up)

      var res = await db.loadSKU()
    expect(res[0].id).to.equal(1)
    expect(res[0].description).to.equal('oldsku')
    expect(res[0].weight).to.equal(20)
    expect(res[0].volume).to.equal(20)
    expect(res[0].notes).to.equal('old')
    expect(res[0].price).to.equal(6)
    expect(res[0].position).to.equal(6)
    expect(res[0].availableQuantity).to.equal(6)
    })
}

function testDeleteSKU(db){
    test('Delete a Sku', async()=> {
    var s = new sku(1,'newest sku',10,10,'brandnew',5,5,5)
    await db.insertSKU(s)
    await db.deletesSKU(1)
    expect(res.length).to.equal(0); //should return nothing

    })
}

describe('Insert and Modify SKU', () =>{
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
        //removing InternalOrder dependencies to test the insertion
    });

    afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new skuDBU('ezwh.db');

    testsearchAssignedPosition(db);
})

function testsearchAssignedPosition(db) {

    test('Search assigned Position',async() =>{

        var s = new sku(1,'newest sku',10,10,'brandnew',5,5,5)
        await db.insertSKU(s);
         res = await db.searcAssignedPosition(5);

        expect(res).to.equal(true);
    })
}