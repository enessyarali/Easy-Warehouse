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

    setType(newType) {
        this.type = newType;
    }

    // removes the fields passed in the toBeRemoved array
    clean(toBeRemoved) {
        for (let attr of toBeRemoved) {
            this[attr] = undefined;
        }
        return this;
    }

}

module.exports = User;