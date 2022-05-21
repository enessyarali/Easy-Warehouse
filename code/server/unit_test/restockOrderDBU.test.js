'use strict';

const { expect } = require('chai');
const RestockOrderDBU = require('../database_utilities/restockOrderDBU');
const RKO = require('../model/restockOrder');
const RestockOrder = RKO.RestockOrder;
const ProductRKO = RKO.ProductRKO;
const dbSet = require('./dataBaseSetUp');

describe('Load Restock Order', () => {
    beforeAll(async () => {
        await dbSet.prepareTable();
    }); 

    afterAll(async ()=> {
       await dbSet.resetTable();
    }); 

    const db = new RestockOrderDBU('ezwh.db');

    testGetRestockOrder(db);
});

function testGetRestockOrder(db){
    test('retrive all RestockOrder', async () => {
        var res = await db.loadRestockOrder();
        expect(res.length).to.equal(2);
    });

    test('retrive an order by Id', async () => {
        var res = await db.loadRestockOrder(1);

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].state).to.equal('ISSUED');
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('descrizione1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].skuItems[0].SKUId).to.equal(1);
        expect(res[0].skuItems[0].rfid).to.equal('123');
    });

    test('retrive order by State', async () => {
        var res = await db.loadRestockOrder(undefined,'ISSUED');

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].state).to.equal('ISSUED');
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('descrizione1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
        expect(res[0].skuItems[0].SKUId).to.equal(1);
        expect(res[0].skuItems[0].rfid).to.equal('123');
    });

    test('retrive item to return', async () => {
        var res = await db.selectReturnItems(1);

        expect(res[0].SKUid).to.equal(1);
        expect(res[0].rfid).to.equal('123');
    }) 
}

 describe('Insert and modify Restock Order',() => {
    beforeAll(async () => {
        await dbSet.resetTable();
        await dbSet.prepareTable();
        await dbSet.voidRestockOrder();
    });

    afterAll(async () => {
        await dbSet.resetTable();
    });

    const db = new RestockOrderDBU('ezwh.db');

    testInsertRestockOrder(db);
    testUpdateRestockOrderd(db);
    testDeleteRestockOrder(db);
});

function testInsertRestockOrder(db){
    test('Insert a new Order', async () => {
        var p = new ProductRKO(1, "descrizione1", 1, 1);
        await db.insertRestockOrder('2022/04/04',p,5);

        var res = await db.loadRestockOrder();

        expect(res[0].issueDate).to.equal('2022/04/04');
        expect(res[0].products[0].SKUId).to.equal(1);
        expect(res[0].products[0].description).to.equal('descrizione1');
        expect(res[0].products[0].price).to.equal(1);
        expect(res[0].products[0].qty).to.equal(1);
    });
}

function testUpdateRestockOrderd(db){
    var orderId = 1;
    test('Update state of an existing Order', async () => {
        await db.patchRestockOrderState(orderId, 'ISSUED');

        var res = await db.loadRestockOrder(orderId);
        expect(res[0].state).to.equal('ISSUED');
    });

    test('Update skuItem of an existing Order', async () => {
        var si = {rfid: 123, SKUId: 1};
        await db.patchRestockOrderSkuItems(orderId,si);

        var res = await db.loadRestockOrder(orderId);

        expect(res[0].skuItems[0].SKUId).to.equal(1);
        expect(res[0].skuItems[0].rfid).to.equal('123');
    });

    test('Update transportNote of an existing Order', async () => {
        var tn = {deliveryDate:"2021/12/29"};
        await db.patchRestockOrderTransportNote(orderId,tn);

        var res = await db.loadRestockOrder(orderId);
        expect(JSON.stringify(res[0].transportNote)).to.equal(JSON.stringify(tn));
    });
}

function testDeleteRestockOrder(db){
    var orderId = 1;
    test('Delete an existing Order', async () => {
        await db.deleteRestockOrder(orderId);
        var res = await db.loadRestockOrder(orderId);
        expect(res.length).to.equal(0);
    });
}
