class returnOrder {
    constructor(id,returnDate,products,restockOrderId){
        this.id =id;
        this.returnDate =returnDate;
        this.products = products;
        this.restockOrderId = restockOrderId;
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
    module.exports ={returnOrder : returnOrder , ProductIO : ProductIO}