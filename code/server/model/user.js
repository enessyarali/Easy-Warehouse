'use strict';

class User {

    // the field password was removed.
    // the comparison is made directly by the login userDBU function.

    constructor(id, name, surname, email, type) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.type = type;
    }

}

module.exports = User;