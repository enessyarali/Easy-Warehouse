class InternalOrder{

    constructor(id,issueDate,state,products,customerId){

        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.products = products;
        this.customerId =customerId ;
    }
}

module.exports = InternalOrder ;