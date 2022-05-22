'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const Position = require('../model/position');
const { getPositionCoordinates, getPositionId } = require('../model/position.js');

describe('Test Position', () => {
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
    testPosition();  
});

function testPosition(){
    test('Create Position', () => {
        const p = new Position('111','1','1','1',500,500,100,100);

        expect(p.positionID).to.equal('111');
        expect(p.aisleID).to.equal('1');
        expect(p.row).to.equal('1');
        expect(p.col).to.equal('1');
        expect(p.maxWeight).to.equal(500);
        expect(p.maxVolume).to.equal(500);
        expect(p.occupiedWeight).to.equal(100);
        expect(p.occupiedVolume).to.equal(100);
    });
    test('Update Weight and Volume', () =>{
        const p = new Position('111','1','1','1',500,500,100,100);

        p.updateOccupiedWeightAndVolume();

        expect(p.occupiedWeight).to.equal(0);
        expect(p.occupiedVolume).to.equal(0);
    });
    test('Get Coordinates', () =>{
        const coord = getPositionCoordinates('111122223333');

        expect(coord[0]).to.equal('1111');
        expect(coord[1]).to.equal('2222');
        expect(coord[2]).to.equal('3333');
    });
    test('Get PositionId', () =>{
        const coord = getPositionId('1111','2222','3333');

        expect(coord).to.equal('111122223333');
    });
    test('Test Error', () => {
        const p = new Position('111','1','1','1',500,500,100,100);

        try{
            p.updateOccupiedWeightAndVolume(800,800);
        }
        catch(err){
            expect(err.message).to.equal("Position cannot store the required SKU. Operation aborted.");
        }
    });
}
