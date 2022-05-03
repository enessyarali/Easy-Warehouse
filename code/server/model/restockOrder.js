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
}
module.exports =restockOrder ;