'use strict';

class SKUitem {

    constructor(rfid, skuId, isAvailable, dateOfStock) {
        this.RFID = rfid;
        this.SKUId = skuId;
        this.Available = isAvailable;
        this.DateOfStock = dateOfStock;
    }

}

module.exports = SKUitem;