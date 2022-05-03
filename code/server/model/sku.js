'use strict';

class SKU {

    // attributes
    // - id (int)
    // - description (string)
    // - weight (int)
    // - volume (int)
    // - notes (string)
    // - position (string)
    // - availableQuantity (int)
    // - price (float)
    // - testDescriptors (list<int>)

    constructor(id, description, weight, volume, notes, price, availableQuantity) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.price = price;
        this.availableQuantity = availableQuantity;
    }

    set testDescriptors(testDescriptors) {
        this.testDescriptors = testDescriptors;
    }

}

module.exports = SKU;