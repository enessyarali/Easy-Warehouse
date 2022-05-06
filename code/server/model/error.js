'use strict';

class Error {

    // defined error codes
    // 1 - user does not exist
    // 2 - user already exist

    // 10 - No Argument Passed

    constructor(message, code=undefined) {
        this.message = message;
        this.code = code;
    }
}
 module.exports = Error;