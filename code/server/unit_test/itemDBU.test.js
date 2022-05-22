'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const itemDBU = require('../database_utilities/itemDBU');

const item = require('../model/item');


describe('Load Item ',() => {
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
    });
    //at the end of all tests in this file
     afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    }); 

    const db = new itemDBU('ezwh.db');
    
    testLoaditem(db);
})

//ITEM needs to be uploaded to the db by databaseetup like marco did 
function testLoaditem(db){
    test('retrieve all items',async() => {
        var res = await db.loadItem()
    })

    expect(res[0].id).to.equal();
    expect(res[0].description).to.equal();
    expect(res[0].price).to.equal();
    expect(res[0].SKUId).to.equal();
    expect(res[0].supplierId).to.equal();
}

describe('Insert and Modify Item' , () => {
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
    });
    //at the end of all tests in this file
     afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    }); 

    const db = new itemDBU('ezwh.db');
    
    testInsertitem(db);
    testUpdateitem(db);
    testDeleteitem(db);
})

function testInsertitem(db){
    test('Insert a new Item' ,  async() => {
        //create new item to insert 
        var IT = new item('newitem',5,5,5,5)
        await db.insertItem(IT)

        var res = await db.loadItem();
        //check if the insertion succeded correctly 

        expect(res[0].description).to.equal('newitem');
        expect(res[0].price).to.equal(5);
        expect(res[0].SKUId).to.equal(5);
        expect(res[0].supplierId).to.equal(5);
    })


}

function testUpdateitem(db){
    test('Update an Item', async() => {
        await db.updateItem(0,'very new item',10)

        var res = await db.loadItem();

        expect(res[0].description).to.equal('very new item');
        expect(res[0].price).to.equal(10);
    })
}

function testDeleteitem(db){
    test('Delete an item', async() => {
        await db.deleteItem(0)

        var res = await db.loadItem(0);
        expect(res.lenght).to.equal(0) //should return nothing
        
    })
}