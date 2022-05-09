'use strict';

class Error {

    // defined error codes
    // 1 - user does not exist
    // 2 - user already exist
    // 3 - sku does not exist
    // 4 - position cannot store SKU
    // 5 - position does not exist
    // 6 - customer/supplier does not exist
    // 7 - inconsistency skuItem-RFID in internal order
    // 8 - supplier already sells product
    // 10 - No Argument Passed

    constructor(message, code=undefined) {
        this.message = message;
        this.code = code;
    }
}
 module.exports = Error;