'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const SkuDBU = require('../database_utilities/skuDBU');

const SKU = require('../model/sku');


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

    const db = new SkuDBU('ezwh.db');

    testGetSku(db);
});


function testGetSku(db){
    test('Retrieve all SKUs', async () => {
        var res = await db.loadSKU();

        expect(res.length).to.equal(2);
    } );

    test('Get SKU by id', async () => {
        var res = await db.loadSKU(1);

        expect(res[0].id).to.equal(1);
        expect(res[0].description).to.equal('test1');
        expect(res[0].weight).to.equal(1);
        expect(res[0].volume).to.equal(1);
        expect(res[0].notes).to.equal('test1');
        expect(res[0].price).to.equal(1);
        expect(res[0].availableQuantity).to.equal(100);
        expect(res[0].position).to.equal('111');
        expect(res[0].testDescriptors).to.eql([1,2]);
    } );

    
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

    const db = new SkuDBU('ezwh.db');

    testInsertSKU(db);
    testUpdateSKU(db);
    testDeleteSKU(db);
})

function testInsertSKU(db){
 test('Insert a new SKU', async() => {
   
    //Create new sku to insert
    await db.insertSKU('newest sku',10,10,'brandnew',5,5);

    var res = await db.loadSKU(3);
    //check if insertion succeded correctly 
    expect(res[0].id).to.equal(3);
    expect(res[0].description).to.equal('newest sku');
    expect(res[0].weight).to.equal(10);
    expect(res[0].volume).to.equal(10);
    expect(res[0].notes).to.equal('brandnew');
    expect(res[0].price).to.equal(5);
    expect(res[0].position).to.be.null;
    expect(res[0].availableQuantity).to.equal(5);
    
 });

}

function testUpdateSKU(db){
    test('Update a existing SKU', async() => {

    var  up = new SKU(3,'oldsku',20,20,'old',null,6,6)
    await db.updateSKU(up)

    var res = await db.loadSKU(3)
    expect(res[0].id).to.equal(3)
    expect(res[0].description).to.equal('oldsku')
    expect(res[0].weight).to.equal(20)
    expect(res[0].volume).to.equal(20)
    expect(res[0].notes).to.equal('old')
    expect(res[0].price).to.equal(6)
    expect(res[0].position).to.be.null;
    expect(res[0].availableQuantity).to.equal(6)
    })
}

function testDeleteSKU(db){
    test('Delete a Sku', async()=> {
    await db.deleteSKU(3);
    let res = await db.loadSKU(3);
    expect(res.length).to.equal(0); //should return nothing
    })
}

describe('Search Assigned Position', () =>{
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

    const db = new SkuDBU('ezwh.db');
    testSearchAssignedPosition(db);
})

function testSearchAssignedPosition(db) {

    test('Search assigned Position - true',async() =>{
        let res = await db.searchAssignedPosition('111');
        expect(res).to.equal(true);
    })
    test('Search assigned Position - false',async() =>{
        let res = await db.searchAssignedPosition('222');
        expect(res).to.equal(false);
   })
}