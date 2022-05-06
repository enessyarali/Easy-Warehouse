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

    constructor(id=undefined, description, weight, volume, notes, position=undefined, price, availableQuantity) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.price = price;
        this.position = position;
        this.availableQuantity = availableQuantity;
    }

    setTestDescriptors(testDescriptors) {
        this.testDescriptors = testDescriptors;
    }

    modify(newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
        if(this.position && newWeight!=this.weight && newVolume!=this.volume && newAvailableQuantity!=this.availableQuantity) {
            // do something, eventually throw exception
        }
        this.description = newDescription;
        this.weight = newWeight;
        this.volume = newVolume;
        this.notes = newNotes;
        this.price = newPrice;
        this.availableQuantity = newAvailableQuantity;
    }

    delete() {
        if (position) {
            // fetch position and do stuff
        }
    }


}

module.exports = SKU;