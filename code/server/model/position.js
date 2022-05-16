'use strict';

const Error = require('./error');

class Positon {

    constructor(positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight=0, occupiedVolume=0) {
        this.positionID = positionID;
        this.aisleID = aisleID;
        this.row = row;
        this.col = col;
        this.maxWeight = maxWeight;
        this.maxVolume = maxVolume;
        this.occupiedWeight = occupiedWeight;
        this.occupiedVolume = occupiedVolume;
    }

    updateOccupiedWeightAndVolume(newWeight=0, newVolume=0) {
        if (newWeight>this.maxWeight || newVolume>this.maxVolume) {
            throw(new Error("Position cannot store the required SKU. Operation aborted.", 4));
        }
        this.occupiedWeight = newWeight;
        this.occupiedVolume = newVolume;
    }

    // divides the positionId in aisleId, row and col
    // const out = getPositionCoordinates(positionId);
    // out[0] -> aisleId
    // out[1] -> row
    // out[2] -> col
    static getPositionCoordinates(positionId) {
        return positionId.match(/.{1,4}/g);
    }

    static getPositionId(aisleId, row, col) {
        return aisleId.concat(row, col);
    }

}

module.exports = Positon;