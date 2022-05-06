'use strict';

const PositionDBU = require('../database_utilities/positionDBU')

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

    async modify(openDB, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
        if(this.position && newAvailableQuantity!=this.availableQuantity) {
            try {
                // fetch position
                const db = new PositionDBU(openDB);
                const posList = await db.loadPosition(position);
                const pos = posList.pop();
                // update occupiedWeight and Volume
                pos.updateOccupiedWeightAndVolume(newAvailableQuantity*newWeight, newAvailableQuantity*newVolume);
                // update position
                await db.updatePosition(pos.positionID, pos);
            } catch(err) {
                // if there is some exception, propagate it
                throw(err);
            } finally {
                db.close();
            }
        }
        this.description = newDescription;
        this.weight = newWeight;
        this.volume = newVolume;
        this.notes = newNotes;
        this.price = newPrice;
        this.availableQuantity = newAvailableQuantity;
    }

    async delete(openDB) {
        if (position) {
            try {
                // fetch position
                const db = new PositionDBU(openDB);
                const posList = await db.loadPosition(position);
                const pos = posList.pop();
                // reset occupiedWeight and Volume
                pos.updateOccupiedWeightAndVolume();
                // update position
                await db.updatePosition(pos.positionID, pos);
            } catch(err) {
                // if there is some exception, propagate it
                throw(err);
            } finally {  
                db.close();
            }
        }
    }

}

module.exports = SKU;