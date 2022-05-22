'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const userDBU = require('../database_utilities/userDBU');

const USER = require('../model/user');

describe('Test User' , async() =>{
     //at the start
     beforeAll(async () => {
        //clear DB
        await dbSet.resetTable();

    });
    //at the end of all tests in this file
     afterAll(async () => {
        //clear DB at the end
        await dbSet.resetTable();
    }); 

    const db = new userDBU('ezwh.db');

    testInsertUser(db);
    testUpdateUser(db);
    testDeleteUser(db);
} )

function testInsertUser(db){
    test('insert user', async() =>{
        var newuser = new USER(1,'enes','yarali','manager')
        db.insertUser('enesyarali','enes','yarali','Polito','manager') 

         var res = await db.loadUser();

        expect(res[0].username).to.equal('enesyarali')
        expect(res[0].name).to.equal('enes')
        expect(res[0].surname).to.equal('yarali')
        expect(res[0].password).to.equal('Polito')
        expect(res[0].type).to.equal('manager')
    })
}


//NEEDS FIXING 
function testUpdateUser(db){
    test('Update user', async() => {
        var newuser =  newuser = new USER(1,'enes','yarali','manager')
        await db.insertUser(newuser) 

         var res = await db.UpdateUser(newuser)

        expect(res[0]).to.equal() //Number of rows changed 

    })
}

function testDeleteUser(db){
    test('Delete User', async () => {
        var username = 'enesyarali' ;
        var type = 'manager'
        await db.deleteUser(username , type);

        var res = await db.loadUser();

        expect(res.lenght).to.equal(0); //should return nothing 

        

    })
}