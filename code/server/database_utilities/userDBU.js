'use strict';
const User = require('../model/user.js');
const sqlite = require('sqlite3');
const saltHash = require('password-salt-and-hash');

class UserDBU {

    // attributes
    // - db (Database)
    // - dbname (string)

    // constructor
    constructor(dbname) {
        this.dbname = dbname;
        this.db = new sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
        
    }

    // returns true if the password matches, false otherwise
    // if no user matches the pair username, type, an exception is thrown
    async checkPassword(username, type, password) {
        let info;
        try{
            info = await this.#loadPassword(username, type);
        } catch(err) {  // if the database access generates an exception, propagate it
            throw(err);
        }
        if(!info || !info.salt || !info.password)
            throw({error: 'No matching user!\n'});

        return saltHash.verifySaltHash(info.salt, info.password, password);
    }

    loadUser(username=undefined, type=undefined, id=undefined) {
        return new Promise((resolve, reject) => {
            const user = 'SELECT * FROM USERS WHERE email=? AND type=?';
            //const sqlNull = 'SELECT * FROM skus';
            //this.db.all(skuId ? sql : sqlNull, skuId ? [skuId] : [], (err, rows) => {
                this.db.all(user, [username, type], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const users = rows.map((u) => {
                    const user = new User(u.id, u.name, u.surname, u.email, u.type);
                    return user;
                });
                resolve(users);
            });
        });
    }

    // private method to load password information
    #loadPassword(username, type) {
        return new Promise((resolve, reject) => {
            const user = 'SELECT salt, password FROM USERS WHERE email=? AND type=?';
            this.db.get(user, [username, type], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({salt: row.salt, password: row.password});
            });
        });
    }
    
}

module.exports = UserDBU;