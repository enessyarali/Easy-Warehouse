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
    // 9 - SKUitem does not exist
    // 10 - No Argument Passed
    // 11 - TestDescriptor does not exist
    // 12 - RestockOrder does not exist
    // 13 - Incorrect order's status

    // 14 - Dependency detected - delete aborted

    constructor(message, code=undefined) {
        this.message = message;
        this.code = code;
    }
}
 module.exports = Error;