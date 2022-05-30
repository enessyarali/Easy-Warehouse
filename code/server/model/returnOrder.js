class ReturnOrder {
    constructor(id,returnDate,restockOrderId){
        this.id =id;
        this.returnDate =returnDate;
        this.restockOrderId = restockOrderId;
    }

    setProducts(products) {
        this.products = products;
    }

    // removes the fields passed in the toBeRemoved array
    clean(toBeRemoved) {
        for (let attr of toBeRemoved) {
            this[attr] = undefined;
        }
        return this;
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