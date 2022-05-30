'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const PositionDBU = require('../database_utilities/positionDBU');
const Position = require('../model/position')
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

    const db = new PositionDBU('ezwh.db');

   testGetPosition(db);
});


function testGetPosition(db){
    test('Retrieve All Positions', async () =>{
        var res = await db.loadPosition()

        expect(res.length).to.equal(2)
    } )

    test('Retrieve Position by Id', async () =>{
        var res = await db.loadPosition('111');
        expect(res[0].positionID).to.equal('111');
        expect(res[0].aisleID).to.equal('1');
        expect(res[0].row).to.equal('1');
        expect(res[0].col).to.equal('1');
        expect(res[0].maxWeight).to.equal(500);
        expect(res[0].maxVolume).to.equal(500);
        expect(res[0].occupiedWeight).to.equal(100);
        expect(res[0].occupiedVolume).to.equal(100);
    })

}

describe('Insert Position', () => {
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

    const db = new PositionDBU('ezwh.db');

    testInsertPosition(db);
    
});

function testInsertPosition(db){
    test('Insert New Position' , async() => {
        await db.insertPosition('333', '3', '3', '3', 100, 100); 

        var res = await db.loadPosition('333');
        expect(res[0].positionID).to.equal('333');
        expect(res[0].aisleID).to.equal('3');
        expect(res[0].row).to.equal('3');
        expect(res[0].col).to.equal('3');
        expect(res[0].maxWeight).to.equal(100);
        expect(res[0].maxVolume).to.equal(100);
        expect(res[0].occupiedWeight).to.equal(0);
        expect(res[0].occupiedVolume).to.equal(0);
    })
}

describe('Update Position', () => {
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
        //await dbSet.resetTable();
    }); 

    const db = new PositionDBU('ezwh.db');

    testUpdatePosition(db);
    
});

function testUpdatePosition(db){
    test('Update Position - passing parameters' , async() => {
        await db.updatePosition('111', undefined, undefined,'1111','2222','3333',1000,1000,800,800)

        var res = await db.loadPosition('111122223333')
        expect(res[0].positionID).to.equal('111122223333')
        expect(res[0].aisleID).to.equal('1111')
        expect(res[0].row).to.equal('2222')
        expect(res[0].col).to.equal('3333')
        expect(res[0].maxWeight).to.equal(1000)
        expect(res[0].maxVolume).to.equal(1000)
        expect(res[0].occupiedWeight).to.equal(800)
        expect(res[0].occupiedVolume).to.equal(800)
    })
    test('Update Position - passing new positionId' , async() => {
        await db.updatePosition('111122223333', undefined, '111122223331')

        var res = await db.loadPosition('111122223331')
        expect(res[0].positionID).to.equal('111122223331')
        expect(res[0].aisleID).to.equal('1111')
        expect(res[0].row).to.equal('2222')
        expect(res[0].col).to.equal('3331')
        expect(res[0].maxWeight).to.equal(1000)
        expect(res[0].maxVolume).to.equal(1000)
        expect(res[0].occupiedWeight).to.equal(800)
        expect(res[0].occupiedVolume).to.equal(800)
    })
    test('Update Position - passing new position object' , async() => {
        await db.updatePosition('111122223331', new Position('111122223331', '1111', '2222', '3331', 1000, 42, 800, 801))

        var res = await db.loadPosition('111122223331')
        expect(res[0].positionID).to.equal('111122223331')
        expect(res[0].aisleID).to.equal('1111')
        expect(res[0].row).to.equal('2222')
        expect(res[0].col).to.equal('3331')
        expect(res[0].maxWeight).to.equal(1000)
        expect(res[0].maxVolume).to.equal(42)
        expect(res[0].occupiedWeight).to.equal(800)
        expect(res[0].occupiedVolume).to.equal(801)
    })

}

describe('Delete Position', () => {
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

    const db = new PositionDBU('ezwh.db');

    testDeletePosition(db)
    
});


function testDeletePosition(db){
    test('Delete Position' , async() => {
        await db.deletePosition('111122223331');

        var res = await db.loadPosition('111122223331');
        expect(res.length).to.equal(0);
    })
    test('Delete Position - dependency detected' , async() => {
        try {
            await db.deletePosition('111');
        } catch(err) {
            expect(err.message).to.equal("Dependency detected. Delete aborted.");
        }
    });
}