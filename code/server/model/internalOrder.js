class InternalOrder{

    constructor(id, issueDate, state, customerId){

        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.customerId = customerId ;
    }

    setProducts(products) {
        this.products = products;
    }
}

class ProductIO{

    constructor(SKUId, description, price, qty=undefined, rfid=undefined) {
        this.SKUId = SKUId;
        this.description = description;
        this.price = price;
        this.qty = qty ? qty : undefined;
        this.RFID = rfid ? rfid : undefined;
    }
}

module.exports = {InternalOrder: InternalOrder, ProductIO: ProductIO} ;