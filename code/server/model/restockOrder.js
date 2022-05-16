class RestockOrder{
    constructor(id,issueDate,state,supplierId,transportNote){
        this.id =id;
        this.issueDate =issueDate ;
        this.state =state ;
        this.supplierId =supplierId ;
        this.transportNote = JSON.parse(transportNote);
    }
    setProducts(products) {
        this.products = products;
    }
    setSkuItems(skuItems) {
        this.skuItems = skuItems;
    }
}

class ProductRKO{

    constructor(SKUId, description, price, qty) {
        this.SKUId = SKUId;
        this.descripton = description;
        this.price = price;
        this.qty = qty;
    }
}

module.exports ={RestockOrder : RestockOrder , ProductRKO : ProductRKO}