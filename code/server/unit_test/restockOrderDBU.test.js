'use strict';

const { expect } = require('chai');
const RestockOrderDBU = require('../database_utilities/restockOrderDBU');
const dbSet = require('./dataBaseSetUp');

describe('Load Restock Order', () => {
    beforeAll(() => {
        dbSet.prepareTable();
    });

    afterAll(()=> {
        dbSet.resetTable();
    });

    const db = new RestockOrderDBU('ezwh.db');

    testGetRestockOrder(db);
});

function testGetRestockOrder(db){
    test('retrive all RestockOrder', async () => {
        var res = await db.loadRestockOrder();
        expect(res.length).toStrictEqual(2);
    });

    test('retrive an order by Id', async () => {
        var res = await db.loadRestockOrder(1);
        expect(res.length).toStrictEqual(1);

        expect(res.issueDate).toStrictEqual('2022/04/04');
        expect(res.state).toStrictEqual('ISSUED');
        expect(res.products.SKUId).toStrictEqual(1);
        expect(res.products.description).toStrictEqual('descrizione1');
        expect(res.products.price).toStrictEqual(1);
        expect(res.products.qty).toStrictEqual(1);
        expect(res.skuItems.skuItemId).toStrictEqual(1);
        expect(res.skuItems.rfid).toStrictEqual('123');
    });

    test('retrive order by State', async () => {
        var res = await db.loadRestockOrder('ISSUED');
        expect(res.length).toStrictEqual(1);

        expect(res.issueDate).toStrictEqual('2022/04/04');
        expect(res.state).toStrictEqual('ISSUED');
        expect(res.products.SKUId).toStrictEqual(1);
        expect(res.products.description).toStrictEqual('descrizione1');
        expect(res.products.price).toStrictEqual(1);
        expect(res.products.qty).toStrictEqual(1);
        expect(res.skuItems.skuItemId).toStrictEqual(1);
        expect(res.skuItems.rfid).toStrictEqual('123');
    });

    test('retrive item to return', async () => {
        var res = await db.selectReturnItems(1);
        expect(res.length).toStrictEqual(1);

        expect(res.SKUid).toStrictEqual(1);
        expect(res.rfid).toStrictEqual('123');
    })
}

describe('Insert Restock Order',() => {
    beforeAll(() => {
        dbSet.voidRestockOrder();
    });

    afterAll(() => {
        dbSet.voidRestockOrder();
    });

    const db = new RestockOrderDBU('ezwh.db');
});