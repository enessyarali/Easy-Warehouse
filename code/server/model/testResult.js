'use strict';

class TestResult {

    constructor(SKUitemRFid, id=undefined, descriptorId, date, result) {
        this.SKUitemRFid = SKUitemRFid;
        this.id = id;
        this.descriptorId = descriptorId;
        this.date = date;
        this.result = result;
    }

    setSKUitemRFid(newSKUitemRFid) {
        this.SKUitemRFid = newSKUitemRFid;
    }
}

module.exports = TestResult;