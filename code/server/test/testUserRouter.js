'use strict';

const dbSet = require('../unit_test/dataBaseSetUp');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

/* FUNCTIONAL REQUIREMENTS
 *
 * FR1 Manage users and rights
 *   FR1.1 Define a new user, or modify an existing user
 *   FR1.2 Delete a user
 *   FR1.3 List all users
 *   FR1.4 Search a user
 *   FR1.5 Manage rights
 */


describe('test user apis', () => {

    let u1 = {
        "id": 7,
        "name":"Luca",
        "surname":"Scibetta",
        "email":"clerk2@ezwh.com",
        "username":"clerk2@ezwh.com",
        "type":"clerk",
        "password":"ciao1234"
    };
    
    let u2 = {
        "name":"Ilaria",
        "surname":"Pilo",
        "email":"user2@ezwh.com",
        "username":"user2@ezwh.com",
        "type":"customer",
        "password":"9876abcd"
    };

    let u_invalid1 = {
        "name":"Not",
        "surname":"Valid",
        "email":"user1@ezwh.com",
        "username":"user1@ezwh.com",
        "type":"customer",
        "password":"myPass00000"
    };

    let u_invalid2 = {
        "name":"Not",
        "surname":"Valid",
        "email":"Not an email",
        "username":"Not an email",
        "type":"customer",
        "password":"123456789"
    };

    let u_invalid3 = {
        "name":"Not",
        "surname":"Valid",
        "email":"test@ezwh.com",
        "username":"test@ezwh.com",
        "type":"manager",
        "password":"amogus"
    };

    const c1 = {
        "username":"manager1@ezwh.com",
        "password":"testpassword"
    };

    const i1 = {
        "id":6,
        "username":"manager1@ezwh.com",
        "name":"Andy"
    };

    const c2 = {
        "username":"user1@ezwh.com",
        "password":"testpassword"
    };

    const i2 = {
        "id":1,
        "username":"user1@ezwh.com",
        "name":"John"
    };

    const c3 = {
        "username":"supplier1@ezwh.com",
        "password":"testpassword"
    };

    const i3 = {
        "id":5,
        "username":"supplier1@ezwh.com",
        "name":"Ben"
    };

    const c4 = {
        "username":"clerk1@ezwh.com",
        "password":"testpassword"
    };

    const i4 = {
        "id":3,
        "username":"clerk1@ezwh.com",
        "name":"Hugo"
    };

    const c5 = {
        "username":"qualityEmployee1@ezwh.com",
        "password":"testpassword"
    };

    const i5 = {
        "id":2,
        "username":"qualityEmployee1@ezwh.com",
        "name":"Paul",
    };

    const c6 = {
        "username":"deliveryEmployee1@ezwh.com",
        "password":"testpassword"
    };

    const i6 = {
        "id":4,
        "username":"deliveryEmployee1@ezwh.com",
        "name":"Sayid"
    };

    const c_invalid1 = {
        "username":"manager1@ezwh.com",
        "password":"notTheRightPassword"
    };

    const c_invalid2 = {
        "username":"notauser@ezwh.com",
        "password":"testpassword"
    };

    const c_invalid3 = {
        "username":"notasupplier@ezwh.com",
        "password":"notTheRightPassword"
    };

    const c_invalid4 = {
        "username":"clerk1@ezwh.com",
        "password":"abcdefghijklmnopqrstuvwxyz0123456789"
    };

    const c_invalid5 = {
        "username":"evilEmployee@ezwh.com",
        "password":"testpassword"
    };

    const c_invalid6 = {
        "username":"chad@ezwh.com",
        "password":"gigaChad"
    };

    const newU1 = {
        "oldType":"clerk",
        "newType":"qualityEmployee"
    };

    const newU2 = {
        "oldType":"manager",
        "newType":"clerk"
    };

    const newU_invalid1 = {
        "oldType":"customer",
        "newType":"deliveryEmployee"
    };

    const newU_invalid2 = {
        "oldType":"not a role",
        "newType":"neither this"
    };

    const myUsers = [
        {
            id:1,
            name:"John",
            surname:"Travolta",
            email:"user1@ezwh.com",
            type:"customer"
        },
        {
            id:2,
            name:"Paul",
            surname:"Messy",
            email:"qualityEmployee1@ezwh.com",
            type:"qualityEmployee"
        },
        {
            id:3,
            name:"Hugo",
            surname:"Reyes",
            email:"clerk1@ezwh.com",
            type:"clerk"
        },
        {
            id:4,
            name:"Sayid",
            surname:"Jarrah",
            email:"deliveryEmployee1@ezwh.com",
            type:"deliveryEmployee"
        },
        {
            id:5,
            name:"Ben",
            surname:"Linus",
            email:"supplier1@ezwh.com",
            type:"supplier"
        }
    ]

    // populate the DB
    beforeEach(async () => {
        await dbSet.resetAutoInc();
        await agent.post('/api/newUser').send(u1);
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete(`/api/users/${u1.email}/${u1.type}`);
    });

    getSuppliers('GET /api/suppliers - retrive all suppliers in the system', 200, [myUsers[4]]);

    getUsers('GET /api/users - retrive all users(excluding managers) in the system', 200, [...myUsers, u1]);

    addUser('POST /api/newUser - correctly add a new user', 201, u2);
    addUser('POST /api/newUser - user already existing', 409, u_invalid1);
    addUser('POST /api/newUser - wrong user data', 422, u_invalid2);
    addUser('POST /api/newUser - trying to create a manager', 422, u_invalid3);

    loginManager('POST /api/managerSessions - correct manager log in', 200, c1, i1);
    loginManager('POST /api/managerSessions - wrong manager credentials', 401, c_invalid1, i1);

    loginCustomer('POST /api/customerSessions - correct customer log in', 200, c2, i2);
    loginCustomer('POST /api/customerSessions - wrong customer credentials', 401, c_invalid2, i2);

    loginSupplier('POST /api/supplierSessions - correct supplier log in', 200, c3, i3);
    loginSupplier('POST /api/supplierSessions - wrong supplier credentials', 401, c_invalid3, i3);

    loginClerk('POST /api/clerkSessions - correct clerk log in', 200, c4, i4);
    loginClerk('POST /api/clerkSessions - wrong clerk credentials', 401, c_invalid4, i4);

    loginQualityEmployee('POST /api/qualityEmployeeSessions - correct quality employee log in', 200, c5, i5);
    loginQualityEmployee('POST /api/qualityEmployeeSessions - wrong quality employee credentials', 401, c_invalid5, i5);

    loginDeliveryEmployee('POST /api/deliveryEmployeeSessions - correct delivery employee log in', 200, c6, i6);
    loginDeliveryEmployee('POST /api/deliveryEmployeeSessions - wrong delivery employee credentials', 401, c_invalid6, i6);

    modifyUser('PUT /api/users/:username - correctly modify user type', 200, u1, newU1);
    modifyUser('PUT /api/users/:username - wrong username', 404, {username:"thismaildoesnotexist@ezwh.com"}, newU1);
    modifyUser('PUT /api/users/:username - wrong old type', 404, u1, newU_invalid1);
    modifyUser('PUT /api/users/:username - invalid username', 422, {username:"this is not a mail"}, newU1);
    modifyUser('PUT /api/users/:username - invalid body', 422, u1, newU_invalid2);
    modifyUser('PUT /api/users/:username - trying to change type of a manager', 422, {username:"manager1@ezwh.com"}, newU2);

    deleteUser('DELETE /api/users/:username/:type - correctly delete a user', 204, u1.username, u1.type);
    deleteUser('DELETE /api/users/:username/:type - invalid data', 422, "not mail", u1.type);
    deleteUser('DELETE /api/users/:username/:type - trying to delete a manager', 422, u1.username, "manager");
    deleteUser('DELETE /api/users/:username/:type - correctly delete a user', 204, u1.username, u1.type);
});

function getSuppliers(description, expectedHTTPStatus, users) {
    it(description, async function() {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/suppliers');
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(users.length);
            let i = 0;
            for (let u of r.body) {
                u.id.should.equal(users[i].id);
                u.name.should.equal(users[i].name);
                u.surname.should.equal(users[i].surname);
                u.email.should.equal(users[i].email);
                i++;
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });
}

// FR1.3 List all users
function getUsers(description, expectedHTTPStatus, users) {
    it(description, async function() {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/users');
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(users.length);
            let i = 0;
            for (let u of r.body) {
                u.id.should.equal(users[i].id);
                u.name.should.equal(users[i].name);
                u.surname.should.equal(users[i].surname);
                u.email.should.equal(users[i].email);
                u.type.should.equal(users[i].type);
                i++;
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });
}

// FR1.1 Define a new user
function addUser(description, expectedHTTPStatus, u) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/newUser').send(u);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the deletion
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/users/${u.username}/${u.type}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });
}

function loginManager(description, expectedHTTPStatus, c, i) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rLogin = await agent.post('/api/managerSessions').send(c);
            rLogin.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if(rLogin.status === 200) {
                rLogin.body.id.should.equal(i.id);
                rLogin.body.username.should.equal(i.username);
                rLogin.body.name.should.equal(i.name);
            }
        } catch(err) {console.log(err);}
    });
}

function loginCustomer(description, expectedHTTPStatus, c, i) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rLogin = await agent.post('/api/customerSessions').send(c);
            rLogin.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if(rLogin.status === 200) {
                rLogin.body.id.should.equal(i.id);
                rLogin.body.username.should.equal(i.username);
                rLogin.body.name.should.equal(i.name);
            }
        } catch(err) {console.log(err);}
    });
}

function loginSupplier(description, expectedHTTPStatus, c, i) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rLogin = await agent.post('/api/supplierSessions').send(c);
            rLogin.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if(rLogin.status === 200) {
                rLogin.body.id.should.equal(i.id);
                rLogin.body.username.should.equal(i.username);
                rLogin.body.name.should.equal(i.name);
            }
        } catch(err) {console.log(err);}
    });
}

function loginClerk(description, expectedHTTPStatus, c, i) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rLogin = await agent.post('/api/clerkSessions').send(c);
            rLogin.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if(rLogin.status === 200) {
                rLogin.body.id.should.equal(i.id);
                rLogin.body.username.should.equal(i.username);
                rLogin.body.name.should.equal(i.name);
            }
        } catch(err) {console.log(err);}
    });
}

function loginQualityEmployee(description, expectedHTTPStatus, c, i) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rLogin = await agent.post('/api/qualityEmployeeSessions').send(c);
            rLogin.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if(rLogin.status === 200) {
                rLogin.body.id.should.equal(i.id);
                rLogin.body.username.should.equal(i.username);
                rLogin.body.name.should.equal(i.name);
            }
        } catch(err) {console.log(err);}
    });
}

function loginDeliveryEmployee(description, expectedHTTPStatus, c, i) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rLogin = await agent.post('/api/deliveryEmployeeSessions').send(c);
            rLogin.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if(rLogin.status === 200) {
                rLogin.body.id.should.equal(i.id);
                rLogin.body.username.should.equal(i.username);
                rLogin.body.name.should.equal(i.name);
            }
        } catch(err) {console.log(err);}
    });
}

// FR1.1 Modify a user type
function modifyUser(description, expectedHTTPStatus, u, newT) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/users/${u.username}`).send(newT);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            if(rUpdate.status === 200)
                u.type = newT.newType;
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

// FR1.2 Delete a user
function deleteUser(description, expectedHTTPStatus, username, type) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/users/${username}/${type}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}