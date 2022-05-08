class restockOrder{
    constructor(id,issueDate,state,products,supplierId,transportNote,skuItems){
        this.id =id;
        this.issueDate =issueDate ;
        this.state =state ;
        this.products =products ;
        this.supplierId =supplierId ;
        this.transportNote = transportNote;
        this.skuItems =skuItems;
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

module.exports ={restockOrder : restockOrder , ProductIO : ProductIO}