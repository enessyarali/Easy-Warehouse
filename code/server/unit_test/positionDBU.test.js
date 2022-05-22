'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const positionDBU = require('../database_utilities/positionDBU');

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

    testGetItem(db);
});
