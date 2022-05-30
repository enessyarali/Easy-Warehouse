class RestockOrder{
    constructor(id,issueDate,state,supplierId,transportNote){
        this.id =id;
        this.issueDate =issueDate ;
        this.state =state ;
        this.supplierId =supplierId ;
        this.transportNote = transportNote ? JSON.parse(transportNote) : undefined;
        this.skuItems = [];
    }
    setProducts(products) {
        this.products = products;
    }
    setSkuItems(skuItems) {
        this.skuItems = skuItems;
    }

    // removes the fields passed in the toBeRemoved array
    clean(toBeRemoved) {
        for (let attr of toBeRemoved) {
            this[attr] = undefined;
        }
        return this;
    }
}

class ProductRKO{

    constructor(SKUId, description, price, qty) {
        this.SKUId = SKUId;
        this.description = description;
        this.price = price;
        this.qty = qty;
    }
}

module.exports ={RestockOrder : RestockOrder , ProductRKO : ProductRKO}