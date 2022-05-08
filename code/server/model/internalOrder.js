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
        this.descripton = description;
        this.price = price;
        this.qty = qty;
        this.rfid = rfid;
    }
}

module.exports = {InternalOrder: InternalOrder, ProductIO: ProductIO} ;