'use strict';

class SKUitem {

    constructor(rfid, skuId, isAvailable, dateOfStock) {
        this.RFID = rfid;
        this.SKUId = skuId;
        this.Available = isAvailable;
        this.DateOfStock = dateOfStock;
    }

    // removes the fields passed in the toBeRemoved array
    clean(toBeRemoved) {
        for (let attr of toBeRemoved) {
            this[attr] = undefined;
        }
        return this;
    }

}

module.exports = SKUitem;