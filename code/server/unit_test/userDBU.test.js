'use strict';

const { expect } = require('chai');
const dbSet = require('./dataBaseSetUp');

const userDBU = require('../database_utilities/userDBU');

const User = require('../model/user');

describe('Load Users' , () =>{
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

    testGetUsers(db);
} );

function testGetUsers(db) {
    test('retrieve all non-manager Users', async () => {
        let res = await db.loadUser();
        expect(res.length).to.equal(5);
    });
    test('retrieve a User by Id', async () => {
        let res = await db.loadUser(null, null, 1);
        
        expect(res[0].id).to.equal(1);
        expect(res[0].name).to.equal('John');
        expect(res[0].surname).to.equal('Travolta');
        expect(res[0].email).to.equal('user1@ezwh.com');
        expect(res[0].type).to.equal('customer');
    });
    test('retrieve a User by username and type', async () => {
        let res = await db.loadUser('user1@ezwh.com', 'customer');
        
        expect(res[0].id).to.equal(1);
        expect(res[0].name).to.equal('John');
        expect(res[0].surname).to.equal('Travolta');
        expect(res[0].email).to.equal('user1@ezwh.com');
        expect(res[0].type).to.equal('customer');
    });
    test('retrieve a User by type', async () => {
        let res = await db.loadUser(null, 'supplier');
        
        expect(res[0].id).to.equal(5);
        expect(res[0].name).to.equal('Ben');
        expect(res[0].surname).to.equal('Linus');
        expect(res[0].email).to.equal('supplier1@ezwh.com');
        expect(res[0].type).to.equal('supplier');
    });
    test('try User.clean and User.setType', async () => {
        let res = await db.loadUser(null, null, 5);
        
        const u = res[0].clean(['id']);
        u.setType('manager');
        expect(u.id).to.be.undefined;
        expect(u.type).to.equal('manager');
    });
}

describe('Add new Users' , () =>{
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
} );

function testInsertUser(db){
    test('Insert user', async() =>{
        await db.insertUser('test@ezwh.com', 'testName', 'testSurname', '1234', 'customer'); 

        let res = await db.loadUser(null, null, 7);

        expect(res[0].id).to.equal(7);
        expect(res[0].name).to.equal('testName');
        expect(res[0].surname).to.equal('testSurname');
        expect(res[0].email).to.equal('test@ezwh.com');
        expect(res[0].type).to.equal('customer');
    });
    test('Insert new role for already registered username', async() =>{
        await db.insertUser('user1@ezwh.com', 'testName', 'testSurname', '1234', 'supplier'); 

        let res = await db.loadUser(null, null, 8);

        expect(res[0].id).to.equal(8);
        expect(res[0].name).to.equal('testName');
        expect(res[0].surname).to.equal('testSurname');
        expect(res[0].email).to.equal('user1@ezwh.com');
        expect(res[0].type).to.equal('supplier');
    });
    test('user already present', async() =>{
        try {
            await db.insertUser('manager1@ezwh.com', 'testName', 'testSurname', '1234', 'manager');
        } catch(err) {
            expect(err.message).to.equal('User already exists.');
        }
    });
}

describe('Modify Users' , () =>{
    //at the start
    beforeAll(async () => {
       //clear DB
       await dbSet.resetTable();
       // populate DB
       await dbSet.prepareTable();
   });
   //at the end of all tests in this file
    afterAll(async () => {
       //clear DB at the end
       await dbSet.resetTable();
   }); 

   const db = new userDBU('ezwh.db');

   testUpdateUser(db);
} );


function testUpdateUser(db){
    test('Update user', async() => {
        var newuser = new User(7, 'testName','NEW-SURNAME','mail1','customer');
        let res = await db.updateUser(newuser);

        expect(res).to.equal(1);    //Number of rows changed

        res = await db.loadUser(null, null, 7);

        expect(res[0].id).to.equal(7);
        expect(res[0].name).to.equal('testName');
        expect(res[0].surname).to.equal('NEW-SURNAME');
        expect(res[0].email).to.equal('mail1');
        expect(res[0].type).to.equal('customer');
    });
}

describe('Delete Users' , () =>{
    //at the start
    beforeAll(async () => {
       //clear DB
       await dbSet.resetTable();
       // populate DB
       await dbSet.prepareTable();
   });
   //at the end of all tests in this file
    afterAll(async () => {
       //clear DB at the end
       await dbSet.resetTable();
   }); 

   const db = new userDBU('ezwh.db');

   testDeleteUser(db);
} );

function testDeleteUser(db){
    test('Delete User', async () => {
        await db.deleteUser('mail1' , 'customer');

        var res = await db.loadUser(null, null, 7);

        expect(res.length).to.equal(0); //should return nothing

    });
}

describe('Check Password' , () =>{
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

   testCheckPassword(db);
} );

function testCheckPassword(db){
    test('Check password - true', async () => {
        let res = await db.checkPassword('manager1@ezwh.com', 'manager', 'testpassword');
        expect(res.id).to.equal(6); //the password is right
        expect(res.username).to.equal('manager1@ezwh.com');
        expect(res.name).to.equal('Andy');
        expect(res.surname).to.equal('Cheaper');
    });
    test('Check password - false', async () => {
        let res = await db.checkPassword('manager1@ezwh.com', 'manager', 'wrongpassword');
        expect(res).to.equal(false); //the password is wrong
    });
}