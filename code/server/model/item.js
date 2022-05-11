'use strict';

class Item {

    constructor(description, price, SKUId, supplierId, id=undefined){
        this.id =id;
        this.description = description;
        this.price = price;
        this.SKUId =SKUId,
        this.supplierId = supplierId;
    }

} 

module.exports = Item ;