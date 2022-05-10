class ReturnOrder {
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

class ProductRTO{
    
    constructor(SKUId, description, price, rfid=undefined) {
        this.SKUId = SKUId;
        this.descripton = description;
        this.price = price;
        this.rfid = rfid;
    }
}
    module.exports ={ReturnOrder : ReturnOrder , ProductRTO : ProductRTO}