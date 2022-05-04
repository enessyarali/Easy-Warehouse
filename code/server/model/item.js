'use strict';

class Item {

    constructor(description, price, SKUId, supplierId, id=undefined){
        this.id =id;
        this.description = description;
        this.price = price;
        this.SKUId =SKUId,
        this.supplierId = supplierId;
    }

    modify(description, price) {
        this.description = description;
        this.price = price;
    }

} 

module.exports = Item ;