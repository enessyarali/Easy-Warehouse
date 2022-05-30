'use strict';

class TestDescriptor {

    constructor(id, name, procedureDescription, SKUid) {
        this.id = id;
        this.name = name;
        this.procedureDescription = procedureDescription;
        this.idSKU = SKUid;
    }
}

module.exports = TestDescriptor;