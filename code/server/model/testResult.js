'use strict';

class TestResult {

    constructor(id=undefined, descriptorId, date, result) {
        this.id = id;
        this.idTestDescriptor = descriptorId;
        this.Date = date;
        this.Result = result;
    }
}

module.exports = TestResult;