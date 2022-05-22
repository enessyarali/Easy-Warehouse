'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const testDescriptorDBU = require('../database_utilities/testDescriptorDBU');

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

    const db = new testDescriptorDBU('ezwh.db');

    testloadtestDescriptor(db);


})

// BY ID PART NEEDS FIXING
function testloadtestDescriptor(db) {
    test('retrieve all test descriptor' , async () => {
        var res = await db.loadTestDescriptor()
        expect(res.length).to.equal(2);
    } )

    //ADD BY ID PART !!
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

    const db = new testDescriptorDBU('ezwh.db');


    testinserttestdescriptor(db);
    testupdatetestdescriptor(db);
    testdeletetestdescriptor(db);
})

function testinserttestdescriptor(db){
    test('Insert new Test Descriptor' ,async () => {
        await db.insertTestDescriptor('newtest','newesttestever',1)
        var res = await db.loadTestDescriptor();

        expect(res[0].name).to.equal('newest')
        expect(res[0].procedureDescription).to.equal('newesttestever')

    } )
} 

function testupdatetestdescriptor(db){
    test('Update Test Descriptor', async ()  => {
        await db.updateTestDescriptor(1,'mytest','newprocedure',3)

        var res = await db.loadTestDescriptor(1);
        expect(res[0].id).to.equal(1)
        expect(res[0].name).to.equal('mytest')
        expect(res[0].procedureDescription).to.equal('newprocedure')
        expect(res[0].SKUid).to.equal(3)
    })
}

function testdeletetestdescriptor(db){
    test('Delete Test Descriptor' , async () => {
        const testid = 1
        await db.deleteTestDescriptor(testid);
        var res = db.loadTestDescriptor(testid)
        expect(res.length).to.equal(1) //Should return nothing
    })

}


