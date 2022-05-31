const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const app = require('../../server'); 
var agent = chai.request.agent(app);
const users = require('../utils-users');

testUserCRUD();

function testUserCRUD(){
    myuser = users.newCompleteUser('user12@ezwh.com','John', 'Smith', 'testpassword', 'customer');
    
    describe('Test user CRUD features', ()=>{
        users.testDeleteUser(agent, myuser.username, myuser.type, 204);
        users.testDeleteUser(agent, 'erruser', myuser.type, 422);
        users.testDeleteUser(agent, myuser.username, 'errtype', 422);
        users.testDeleteUser(agent, 'manager1@ezwh.com', 'manager', 422);
        users.testPostNewUser(agent, myuser,201);
        //users.testGetAllUsers(agent, 200);
        users.testEditUser(agent, {"oldType":"customer", "newType":"clerk"}, myuser.username, 200);
        users.testEditUser(agent, {"oldType":"customer", "newType":"clerk"}, myuser.username, 404);
        users.testEditUser(agent, {"oldType":"customer", "newType":"clerk"}, 'notuser@aaa.com', 404);
        users.testEditUser(agent, null, 'notuser@aaa.com', 422);

        /* FIXME - myuser type is changed so, the following time that this suite is executed,
            the first delete has not effect and the first edit breaks a unique constraint.
            By removing the edited user at the end we avoid this issue
        */
        users.testDeleteUser(agent, myuser.username, "clerk", 204);
    });
}

exports.testUserCRUD = testUserCRUD