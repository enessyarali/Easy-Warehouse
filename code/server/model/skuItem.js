'use strict';

class SKUitem {

    constructor(rfid, skuId, isAvailable, dateOfStock) {
        this.rfid = rfid;
        this.skuId = skuId;
        this.isAvailable = isAvailable;
        this.dateOfStock = dateOfStock;
    }

}

module.exports = SKUitem;