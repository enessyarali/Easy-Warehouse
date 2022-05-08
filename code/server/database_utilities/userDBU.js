'use strict';
const User = require('../model/user');
const Error = require('../model/error')
const sqlite = require('sqlite3');
const saltHash = require('password-salt-and-hash');

class UserDBU {

    // attributes
    // - db (Database)

    // constructor
    constructor(dbname, db=undefined) {
        if (!db) {
            this.db = new sqlite.Database(dbname, (err) => {
                if (err) throw err;
            });
        } else {
            this.db = db;
        } 
    }
    close() {
        this.db.close();
    }

    // returns user info if the password matches, false otherwise
    // if no user matches the pair username, type, an exception is thrown
    async checkPassword(username, type, password) {
        let info;
        try{
            info = await this.#loadPassword(username, type);
        } catch(err) {  // if the database access generates an exception, propagate it
            throw(err);
        }
        if(info && saltHash.verifySaltHash(info.salt, info.password, password)) {
            return info.user;
        } else return false;
    }

    loadUser(username=undefined, type=undefined, id=undefined) {
        const sqlUser = 'SELECT * FROM USERS WHERE email=? AND type=?';
        const sqlType = 'SELECT * FROM USERS WHERE type=?';
        const sqlAll = 'SELECT * FROM USERS WHERE type<>"manager"';
        const sqlId = 'SELECT * FROM USERS WHERE id=?'

        let sqlInfo = {sql: undefined, values: undefined};

        if(!username && !type && !id) {
            // get all users, except managers
            sqlInfo.sql = sqlAll;
            sqlInfo.values = [];
        } else if(id && !username && !type) {
            // get user by id
            sqlInfo.sql = sqlId;
            sqlInfo.values = [id];
        } else if(type && !username) {
            // get users by type
            sqlInfo.sql = sqlType;
            sqlInfo.values = [type];
        } else {
            // get user by (username, type) pair
            sqlInfo.sql = sqlUser;
            sqlInfo.values = [username, type];
        }

        return new Promise((resolve, reject) => {
            this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
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

    async insertUser(username, name, surname, password, type) {
        // check whether a user already exist
        const userList = await this.loadUser(username, type);
        if (userList.length !== 0) {
            throw(new Error('User already exists.', 2));
        }
        // encrypt the password
        const hashPassword = saltHash.generateSaltHash(password);
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO USERS (name, surname, email, type, password, salt) VALUES(?,?,?,?,?,?)';
            this.db.run(sqlInsert, [name, surname, username, type, hashPassword.password, hashPassword.salt], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        });
    }

    // this function returns the number of rows which has been modified
    updateUser(user) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE USERS SET name=?, surname=?, email=?, type=? WHERE id=?';
            this.db.run(sqlUpdate, [user.name, user.surname, user.email, user.type, user.id], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    deleteUser(username, type) {
        // delete other things to keep consistency - TODO
        return new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM USERS WHERE username=? AND type=?';
            this.db.run(sqlDelete, [username, type], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }


    // private method to load password information
    #loadPassword(username, type) {
        return new Promise((resolve, reject) => {
            const user = 'SELECT * FROM USERS WHERE email=? AND type=?';
            this.db.get(user, [username, type], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row ? {user: {id: row.id, username: row.email, name: `${row.name} ${row.surname}`}, salt: row.salt, password: row.password} : undefined);
            });
        });
    }
    
}

module.exports = UserDBU;