'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const TestResultDBU = require('../database_utilities/testResultDBU');

describe('Load Test Result', () => {
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

    const db = new TestResultDBU('ezwh.db');

    testGetTestResult(db);
});

function testGetTestResult(db) {
    test('retrieve a TestResult bi RFID', async () => {
        var res = await db.loadTestResult(456);
        expect(res.length).to.equal(2); //shoudl return 2 TestResult
    });

    test('retrieve a TestResult by RFID and TestDescriptorId', async () => {
        var res = await db.loadTestResult(123,1);

        expect(res[0].idTestDescriptor).to.equal(1);
        expect(res[0].Date).to.equal('2022/04/04');
        expect(res[0].Result).to.equal(false);
    });
}

describe('Insert and modify Test Result', () => {
    //at the start
    beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();
        //popolate DB 
        await dbSet.prepareTable();
        //removing TestResult dependencies to test the insertion
        await dbSet.voidTestResult();
    });

    afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    });

    const db = new TestResultDBU('ezwh.db');

    testInsertTestResult(db);
    testUpdateTestResult(db);
    testDeleteTestResult(db);
});

function testInsertTestResult(db) {
    test('Insert a new Test Result', async () => {
        await db.insertTestResult(123,1,'2022/04/04',false);

        await db.insertTestResult(789,2,'2022/04/05',false);


        var res = await db.loadTestResult(123,1);
        //check if the insertion succeded correctly
        expect(res[0].idTestDescriptor).to.equal(1);
        expect(res[0].Date).to.equal('2022/04/04');
        expect(res[0].Result).to.equal(false);
    });
}

function testUpdateTestResult(db) {
    test('Update an existing Test Result', async () => {
        await db.updateTestResult(789,2,2,'2022/04/05','Pass');

        var res = await db.loadTestResult(789,2);
        expect(res[0].idTestDescriptor).to.equal(2);
        expect(res[0].Date).to.equal('2022/04/05');
        expect(res[0].Result).to.equal(true);
    });
    test('Update an existing Test Result - testDescriptor not found', async () => {
        expect(db.updateTestResult(789,2,999,'2022/04/05','Pass')).to.eventually.be.rejected;
    });
    test('Update an existing Test Result - RFID not found', async () => {
        expect(db.updateTestResult('999',2,999,'2022/04/05','Pass')).to.eventually.be.rejected;
    });
    test('Update an existing Test Result - testResult not found', async () => {
        const res = await db.updateTestResult(789,9,2,'2022/04/05','Pass');

        expect(res).to.equal(0);
    });
}

function testDeleteTestResult(db) {
    test('Delete an existing Test Result', async () => {
        await db.deleteTestResult(123,1);
        //try to retrive the just deleted Test Result
        var res = await db.loadTestResult(123,1);
        expect(res.length).to.equal(0); //should return nothing
    });
}

describe('Test Error of Test Result', () => {
    beforeAll(async () => {
        await dbSet.resetTable();
        await dbSet.prepareTable();
    });

    afterAll(async () => {
        await dbSet.resetTable();
    });

    const db = new TestResultDBU('ezwh.db');

    testWrongTestResultLoad(db);
    testWrongTestResultInsert(db);
    testWrongTestResultUpdate(db);
    testWrongTestResultDelete(db);

});

function testWrongTestResultLoad(db) {
    test('Test loadTestResult with wrong parameters ', async () => {

        try{
            await db.loadTestResult(876); //wrong rfid
        }
        catch (err){
            expect(err.message).to.equal("SKUitem does not exist");
        }
    });
}

function testWrongTestResultInsert(db){
    test('Test insertTestResult with wrong rfid ', async () => {

        try{
            await db.insertTestResult(876,1,'2022/04/04',false);; //876
        }
        catch (err){
            expect(err.message).to.equal("SKUitem does not exist. Operation aborted.");
        }
    });
    test('Test insertTestResult with wrong descriptorId ', async () => {

        try{
            await db.insertTestResult(123,5,'2022/04/04',false);; //5
        }
        catch (err){
            expect(err.message).to.equal("TestDescriptor does not exist. Operation aborted");
        }
    });
}

function testWrongTestResultUpdate(db){
    test('Test updateTestResult with wrong rfid ', async () => {

        try{
            await db.updateTestResult(876,2,2,'2022/04/05','Pass'); //876
        }
        catch (err){
            expect(err.message).to.equal("SKUitem does not exist. Operation aborted.");
        }
    });
    test('Test updateTestResult with wrong descriptorId ', async () => {

        try{
            await db.updateTestResult(789,2,5,'2022/04/05','Pass'); //5
        }
        catch (err){
            expect(err.message).to.equal("TestDescriptor does not exist. Operation aborted");
        }
    });
}

function testWrongTestResultDelete(db) {
    test('Test deleteTestResult with wrong rfid ', async () => {

        try{
            await db.deleteTestResult(876,1,'2022/04/04',false);; //876
        }
        catch (err){
            expect(err.message).to.equal("SKUitem does not exist");
        }
    });   
}