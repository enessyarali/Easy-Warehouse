class RestockOrder{
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
    setSkuItems(skuItems) {
        this.skuItems = skuItems;
    }
}

class ProductRKO{

    constructor(SKUId, description, price, qty=undefined) {
        this.SKUId = SKUId;
        this.descripton = description;
        this.price = price;
        this.qty = qty;
    }
}

module.exports ={RestockOrder : RestockOrder , ProductRKO : ProductRKO}