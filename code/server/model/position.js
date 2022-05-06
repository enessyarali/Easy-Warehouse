'use strict';

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

    updateOccupiedWeightAndVolume(weightOffset=-this.occupiedWeight, volumeOffset=-this.occupiedVolume) {
        this.occupiedWeight += weightOffset;
        this.occupiedVolume += volumeOffset; 
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