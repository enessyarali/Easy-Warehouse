'use strict';

class TestDescriptor {

    constructor(id, name, procedureDescription, SKUid) {
        this.id = id;
        this.name = name;
        this.procedureDescription = procedureDescription;
        this.SKUid = SKUid;
    }

    modify(newName, newProcedureDescription, newSKUid) {
        this.name = newName;
        this.procedureDescription = newProcedureDescription;
        this.SKUid = newSKUid;
    }
}

module.exports = TestDescriptor;