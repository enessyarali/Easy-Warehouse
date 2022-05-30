'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const TestDescriptor = require('../model/testDescriptor');
const Sku = require('../model/sku');
const positionDBU = require('../database_utilities/positionDBU');

describe('Test Sku', () => {
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

    testSKU(db);
    
});

function testSKU(db){
    test('Create Sku', () => {
        const s = new Sku(1,'test1',100,100,'test1',undefined,1,100);

        expect(s.id).to.equal(1);
        expect(s.description).to.equal('test1');
        expect(s.weight).to.equal(100);
        expect(s.volume).to.equal(100);
        expect(s.notes).to.equal('test1');
        expect(s.position).to.equal(undefined);
        expect(s.price).to.equal(1);
        expect(s.availableQuantity).to.equal(100);
        expect(s.testDescriptors).to.eql([]);
    });
    test('Insert Test Descriptor', () => {
        const s = new Sku(1,'test1',100,100,'test1',undefined,1,100);
        const t = new TestDescriptor(1,'td1','test1',1);

        s.setTestDescriptors(t);

        expect(s.testDescriptors).to.eql(t);
    });
    test('Insert Position', async () => {
        const s = new Sku(1,'test1',1,1,'test1',undefined,1,3);

        await s.setPosition(db.db,'222');

        expect(s.position).to.equal('222');
    });
    test('Modify Sku', async () => {
        const s = new Sku(1,'test1',1,1,'test1','222',1,10);

        await s.modify(db.db,'altroTest',2,2,'testNote',2,4);

        expect(s.id).to.equal(1);
        expect(s.description).to.equal('altroTest');
        expect(s.weight).to.equal(2);
        expect(s.volume).to.equal(2);
        expect(s.notes).to.equal('testNote');
        expect(s.position).to.equal('222');
        expect(s.price).to.equal(2);
        expect(s.availableQuantity).to.equal(4);
    });
    test('Remove position', async () => {
        const s = new Sku(1,'test1',1,1,'test1','222',1,10);

        await s.setPosition(db.db, null);
        let res = await db.loadPosition('222');

        expect(s.position).to.equal(null);
        expect(res[0].occupiedWeight).to.equal(0);
        expect(res[0].occupiedVolume).to.equal(0);

    });
    test('Delete Sku', async () => {
        const s = new Sku(1,'test1',1,1,'test1','222',1,3);
        //await s.setPosition(db.db,'222');
        await s.delete(db.db);
        let res = await db.loadPosition('222');

        expect(s.position).to.equal(undefined);
        expect(res[0].occupiedWeight).to.equal(0);
        expect(res[0].occupiedVolume).to.equal(0);

    });
    test('Test Error', async () => {
        const s = new Sku(1,'test1',1,1,'test1',undefined,1,3);
        try{
            await s.setPosition(db.db,'999');
        }
        catch(err){
            expect(err.message).to.equal('The provided position does not exist.');
        }

    });
}