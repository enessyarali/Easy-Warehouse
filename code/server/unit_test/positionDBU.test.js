'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const positionDBU = require('../database_utilities/positionDBU');
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

    const db = new positionDBU('ezwh.db');

   testgetposition(db);
});


function testgetposition(db){
    test('Retrieve All Positions', async () =>{
        var res = await db.loadPosition()

        expect(res.lenght).to.equal(2)
    } )

    test('Retrieve Position by Id', async () =>{
        id = '111';
        var res = await db.loadPosition(id);
        expect(res[0].positionID).to.equal('111');
        expect(res[0].aisleID).to.equal('1');
        expect(res[0].row).to.equal('1');
        expect(res[0].col).to.equal('1');
        expect(res[0].maxWeight).to.equal('500');
        expect(res[0].maxVolume).to.equal('500');
        expect(res[0].occupiedWeight).to.equal('100');
        expect(res[0].occupiedVolume).to.equal('100');
    })

}

describe('Insert  Position', () => {
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

    const db = new positionDBU('ezwh.db');

    testInsertPosition(db);
    
});

function testInsertPosition(db){
    test('Insert New Position' , async() => {
        var pos = new Position('222','222','3','1','1',400,400);
        await db.insertPosition(pos) 

        var res = await db.loadPosition();
        expect(res.lenght).to.equal(3)
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
        await dbSet.resetTable();
    }); 

    const db = new positionDBU('ezwh.db');

    testUpdatePosition(db);
    
});

function testUpdatePosition(db){
    test('Update New Position' , async() => {
        await db.updatePosition('111','3','333','3','3','1',1000,1000,800,800)

        var res = db.loadPosition('333')
        expect(res[0].positionID).to.equal('333')
        expect(res[0].aisleID).to.equal('3')
        expect(res[0].row).to.equal('3')
        expect(res[0].col).to.equal('1')
        expect(res[0].maxWeight).to.equal(1000)
        expect(res[0].maxVolume).to.equal(1000)
        expect(res[0].occupiedWeight).to.equal(800)
        expect(res[0].occupiedVolume).to.equal(800)
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

    const db = new positionDBU('ezwh.db');

    testDeletePosition(db)
    
});


function testDeletePosition(db){
    test('Delete Position' , async() => {
        await db.deletPosition('222')

        var res = await db.loadPosition();
        expect(res.lenght).to.equal(1)
    })
}