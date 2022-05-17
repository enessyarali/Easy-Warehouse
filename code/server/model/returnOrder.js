class ReturnOrder {
    constructor(id,returnDate,restockOrderId){
        this.id =id;
        this.returnDate =returnDate;
        this.restockOrderId = restockOrderId;
    }

    setProducts(products) {
        this.products = products;
    }
}   

class ProductRTO{
    
    constructor(SKUId, description, price, rfid) {
        this.SKUId = SKUId;
        this.description = description;
        this.price = price;
        this.RFID = rfid;
    }
}
    module.exports ={ReturnOrder : ReturnOrder , ProductRTO : ProductRTO}