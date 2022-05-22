'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const TestDescriptorDBU = require('../database_utilities/testDescriptorDBU');
const TestDescriptor = require('../model/testDescriptor');

describe('Load Test Descriptor', () => {
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

    const db = new TestDescriptorDBU('ezwh.db');

    testLoadTestDescriptor(db);
})

function testLoadTestDescriptor(db) {
    test('retrieve all test descriptors' , async () => {
        var res = await db.loadTestDescriptor();
        expect(res.length).to.equal(2);
    } )
    test('retrieve test descriptor by id' , async () => {
        var res = await db.loadTestDescriptor(1);
        let td = new TestDescriptor(1, 'td1', 'test1', 1);

        expect(res[0]).to.eql(td);
    } )
}


describe('Insert and Modify TestDescriptor', () => {
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

    const db = new TestDescriptorDBU('ezwh.db');

    testInsertTestDescriptor(db);
    testUpdateTestDescriptor(db);
    testDeleteTestDescriptor(db);
})

function testInsertTestDescriptor(db){
    test('Insert new Test Descriptor' ,async () => {
        await db.insertTestDescriptor('newtest','newesttestever',1)
        var res = await db.loadTestDescriptor(3);

        expect(res[0].name).to.equal('newtest')
        expect(res[0].procedureDescription).to.equal('newesttestever')
        expect(res[0].idSKU).to.equal(1)

    } )
} 

function testUpdateTestDescriptor(db){
    test('Update Test Descriptor', async ()  => {
        await db.updateTestDescriptor(1,'mytest','newprocedure',2)

        var res = await db.loadTestDescriptor(1);
        expect(res[0].id).to.equal(1)
        expect(res[0].name).to.equal('mytest')
        expect(res[0].procedureDescription).to.equal('newprocedure')
        expect(res[0].idSKU).to.equal(2)
    })
}

function testDeleteTestDescriptor(db){
    test('Delete Test Descriptor' , async () => {
        await db.deleteTestDescriptor(3);
        var res = await db.loadTestDescriptor(3)
        expect(res.length).to.equal(0) //Should return nothing
    })
    test('Delete Test Descriptor - dependency detected' , async () => {
        try{
            await db.deleteTestDescriptor(1);
        } catch(err) {
            expect(err.message).to.equal("Dependency detected. Delete aborted.");
        }
    })

}


