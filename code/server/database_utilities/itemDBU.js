'use strict';
const ITEM = require('../model/item.js');
const Error = require('../model/error.js');

const sqlite = require('sqlite3');

class ItemDBU {

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

// get item(s) from the ITEM table and return it/them as an Item object
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

// insert a new Item inside the ITEM table -> if the table doesn't exist, it will be created
    insertItem(item) {
        return new Promise((resolve, reject) => {
           const sqlCreate ='CREATE TABLE IF NOT EXISTS ITEMS ( id INTEGER NOT NULL, description TEXT NOT NULL, price REAL NOT NULL, SKUId INTEGER NOT NULL, supplierId INTEGER NOT NULL, PRIMARY KEY(id AUTOINCREMENT))';
           this.db.all(sqlCreate, [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve('Done');
            });
            const sqlInsert = 'INSERT INTO ITEMS (description,price,SKUId,supplierId) VALUES(?,?,?,?);';
            this.db.all(sqlInsert, [item.description, item.price, item.SKUId, item.supplierId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve('Done');
            });
        });
    }

// update a selected Item in the ITEM table. Return number of rows modified
    updateItem(item) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE ITEMS SET description = ?, price = ? WHERE id == ?;'
            this.db.all(sqlUpdate, [item.description, item.price, item.id], function (err) {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    resolve(this.changes);
                }
            })
        })
    }

// delete one or more Item from the ITEM table given different input. Return number of rows modified
    deleteItem(itemId=undefined,supplierId=undefined,skuId=undefined) {        
        let sqlInfo = {sql: undefined, values: undefined};

        if(itemId) {
            const sqlDeleteFromItem = 'DELETE FROM ITEMS WHERE id == ?';
            sqlInfo.sql = sqlDeleteFromItem;
            sqlInfo.values = [itemId];
        }
        else if(supplierId) {
            const sqlDeleteFromSupplier = 'DELETE FROM ITEMS WHERE supplierId == ?';
            sqlInfo.sql = sqlDeleteFromSupplier;
            sqlInfo.values = [supplierId];
        }
        else if(skuId) {
            const sqlDeleteFromSKU = 'DELETE FROM ITEMS WHERE SKUid == ?';
            sqlInfo.sql = sqlDeleteFromSKU;
            sql.values = [skuId];
        }
        else {
            throw( new Error("No Argument Passed", 10));
        }
        
        return new Promise((resolve, reject) => {
            this.db.all(sqlInfo.sql,sqlInfo.values, function (err) {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    resolve(this.changes);
                }
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