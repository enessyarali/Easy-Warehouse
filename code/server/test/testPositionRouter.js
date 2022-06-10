const Position = require('../model/position')
const dbSet = require('../unit_test/dataBaseSetUp');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

/* FUNCTIONAL REQUIREMENTS
 *
 * FR3.1 Manage positions
 *   FR3.1.1 Define a new position
 *   FR3.1.2 Delete a position
 *   FR3.1.3 List all positions
 *   FR3.1.4 Modify attributes of a position
 */


describe('test position apis', () => {

    // as soon as a position is inserted, occupiedWeight and volume are 0
    const p1 = new Position("800234543412", "8002", "3454", "3412", 1000, 1000, 0, 0);      
    const p2 = new Position("800234543413", "8002", "3454", "3413", 1000, 1000, 0, 0);
    const p3 = new Position("800234543414", "8002", "3454", "3414", 1000, 1000, 0, 0);
    // p1_invalid has a negative maxWeight      
    const p1_invalid = new Position("800234543412", "8002", "3415", "3412", -1000, 1000, 0, 0);
    // p2_invalid has positionID != aisleID + rowID + colID      
    const p2_invalid = new Position("800234543413", "8002", "3415", "0000", 1000, 1000, 0, 0);
    // p3_invalid has colID swapped with maxWeight      
    const p3_invalid = new Position("800234543414", "8002", "3415", 1000, "3414", 1000, 0, 0);
    
    const newP1 = {
        "newAisleID": "8003",
        "newRow": "3455",
        "newCol": "3412",
        "newMaxWeight": 1200,
        "newMaxVolume": 600,
        "newOccupiedWeight": 200,
        "newOccupiedVolume":100
    };
    // newP2_invalid has a typo in newAisleID
    const newP2_invalid = {
        "newAsleID": "8003",
        "newRow": "3455",
        "newCol": "3412",
        "newMaxWeight": 1200,
        "newMaxVolume": 600,
        "newOccupiedWeight": 200,
        "newOccupiedVolume":100
    };

    // populate the DB
    beforeEach(async () => {
        await dbSet.resetTable();
        await agent.post('/api/position').send(p1);
        await agent.post('/api/position').send(p2);
    });
    // de-populate the DB
    afterEach( async () => {
        await agent.delete('/api/position/800234543412');
        await agent.delete('/api/position/800234543413');
    });

    getPositions('GET /api/positions - retrieve all positions in the system', 200, [p1, p2]);

    addPosition('POST /api/position - correctly adding a position', 201, p3);
    addPosition('POST /api/position - passing a negative weight', 422, p1_invalid);
    addPosition('POST /api/position - passing inconsistent position coordinates', 422, p2_invalid);
    addPosition('POST /api/position - swapping 2 parameters', 422, p3_invalid);

    modifyPosition('PUT /api/position/:posID - correctly modify a position', 200, p1.positionID, newP1);
    modifyPosition('PUT /api/position/:posID - passing a field with a typo', 422, p2.positionID, newP2_invalid);
    modifyPosition('PUT /api/position/:posID - position does not exist', 404, "800234543414", newP1);

    patchPositionID('PUT /api/position/:posID/changeID - correctly patch id', 200, p1.positionID, {newPositionID: "800234543469"});
    patchPositionID('PUT /api/position/:posID/changeID - short new positionID', 422, p1.positionID, {newPositionID: "8002345434"});
    patchPositionID('PUT /api/position/:posID/changeID - short old positionID', 422, "80023443413", {newPositionID: "800234543469"});
    patchPositionID('PUT /api/position/:posID/changeID - position does not exist', 404, "800234543414", {newPositionID: "800234543415"});
    // we are breaking a database constraint
    // patchPositionID('PUT /api/position/:posID/changeID - new id already exists', 503, p1.positionID, {newPositionID: "800234543413"});
    
    deletePosition('DELETE /api/position/:posID - correctly delete a position', 204, p1.positionID);
    deletePosition('DELETE /api/position/:posID - short positionID', 422, "80023443413");
    deletePosition('DELETE /api/position/:posID - position does not exist', 404, "800234543414");
});

// FR3.1.3 List all positions
function getPositions(description, expectedHTTPStatus, positions) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.get('/api/positions');
            r.should.have.status(expectedHTTPStatus);
            r.body.length.should.equal(positions.length);
            let i = 0;
            for (let p of r.body) {
                p.positionID.should.equal(positions[i].positionID);
                p.aisleID.should.equal(positions[i].aisleID);
                p.row.should.equal(positions[i].row);
                p.col.should.equal(positions[i].col);
                p.maxWeight.should.equal(positions[i].maxWeight);
                p.maxVolume.should.equal(positions[i].maxVolume);
                p.occupiedWeight.should.equal(positions[i].occupiedWeight);
                p.occupiedVolume.should.equal(positions[i].occupiedVolume);
                i++;
            }
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}

// FR3.1.1 Define a new position
// FR3.1.2 Delete a position
function addPosition(description, expectedHTTPStatus, p) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rInsert = await agent.post('/api/position').send(p);
            rInsert.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rInsert.status==201) {
                // if the insertion was successful, try the deletions
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/position/${p.positionID}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR3.1.4.1 Modify an existing position
function modifyPosition(description, expectedHTTPStatus, oldId, newP) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/position/${oldId}`).send(newP);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rUpdate.status==200) {
                // if the update was successful, try the deletions
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/position/${newP.newAisleID+newP.newRow+newP.newCol}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR3.1.4.1 Modify only the ID of an existing position
function patchPositionID(description, expectedHTTPStatus, oldId, newId) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const rUpdate = await agent.put(`/api/position/${oldId}/changeID`).send(newId);
            rUpdate.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
            if (rUpdate.status==200) {
                // if the update was successful, try the deletions
                startTime = performance.now();
                const rDelete = await agent.delete(`/api/position/${newId.newPositionID}`);
                rDelete.should.have.status(204);
                endTime = performance.now();
                (endTime-startTime).should.lessThanOrEqual(500);
            }
        } catch(err) {console.log(err);}
    });       
}

// FR3.1.2 Delete a position
function deletePosition(description, expectedHTTPStatus, id) {
    it(description, async function () {
        try {
            let startTime = performance.now();
            const r = await agent.delete(`/api/position/${id}`);
            r.should.have.status(expectedHTTPStatus);
            let endTime = performance.now();
            (endTime-startTime).should.lessThanOrEqual(500);
        } catch(err) {console.log(err);}
    });       
}



