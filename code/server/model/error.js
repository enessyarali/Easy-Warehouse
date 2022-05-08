'use strict';

class Error {

    // defined error codes
    // 1 - user does not exist
    // 2 - user already exist
    // 3 - sku does not exist
    // 4 - position cannot store SKU
    // 5 - position does not exist
    // 6 - customer does not exist
    // 10 - No Argument Passed

    constructor(message, code=undefined) {
        this.message = message;
        this.code = code;
    }
}
 module.exports = Error;