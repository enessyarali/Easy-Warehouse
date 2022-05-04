'use strict';
const ITEM = require('../model/item.js');

const sqlite = require('sqlite3');

class itemDBU {

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

    loadItem(id = undefined) {
        return new Promise((resolve, reject) => {
            const sqlNull = 'SELECT * FROM ITEMS';
            const sqlWithId = 'SELECT * FROM ITEMS WHERE id=?';
            this.db.all(id ? sqlWithId : sqlNull, id ? [id] : [], (err, rows) => { //check id exists. If true it makes the query with Id. 
                if (err) {
                    reject(err);
                    return;
                }
                const items = rows.map((i) => {
                    const item = new ITEM(i.description, i.price, i.SKUId, i.supplierId, i.id);
                    return item;
                });
                resolve(items);
            });
        });
    }

    insertItem(item) {
        return new Promise((resolve, reject) => {
           const sqlCreate ='CREATE TABLE IF NOT EXISTS ITEMS ( id INTEGER NOT NULL, description TEXT NOT NULL, price REAL NOT NULL, SKUId INTEGER NOT NULL, supplierId INTEGER NOT NULL, PRIMARY KEY(id AUTOINCREMENT))';
           this.db.all(sqlCreate, [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(1);
            });
            const sqlInsert = 'INSERT INTO ITEMS (description,price,SKUId,supplierId) VALUES(?,?,?,?);';
            this.db.all(sqlInsert, [item.description, item.price, item.SKUId, item.supplierId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(1);
            });
        });
    }

    updateItem(item) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE ITEMS SET description = ?, price = ? WHERE id == ?;'
            this.db.all(sqlUpdate, [item.description, item.price, item.id], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(1);
            })
        })
    }
}

module.exports = ItemDBU;

/*
id  
description
price
SKUId
supplierId
*/