'use strict';
const Item = require('../model/item.js');
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
            this.db.all(id ? sqlWithId : sqlNull, id ? [id] : [], (err, rows) => { 
                if (err) {
                    reject(err);
                    return;
                }
                const items = rows.map((i) => {
                    const item = new Item(i.description, i.price, i.SKUId, i.supplierId, i.id);
                    return item;
                });
                resolve(items);
            });
        });
    }

// insert a new Item inside the ITEM table
    async insertItem(id, description, price, SKUId, supplierId) {
        // check if supplier exist
        const isSupplier = await this.#checkSupplier(supplierId);
        if (!isSupplier)
            throw(new Error("Supplier does not exist. Operation aborted.", 6));
        // check if SKUId exist
        const isSKU = await this.#checkSKU(SKUId);
        if (!isSKU)
            throw(new Error("SKU does not exist. Operation aborted.", 3));
        // check if supplier already sell object
        const isAlreadySelling = await this.#checkConsistency(id, supplierId, SKUId);
        if (isAlreadySelling)
            throw(new Error("Supplier already sells SKU / item. Operation aborted.", 8));
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO ITEMS (id, description, price, SKUId, supplierId) VALUES(?,?,?,?,?);';
            this.db.run(sqlInsert, [id, description, price, SKUId, supplierId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve('Done');
            });
        });
    }

// update a selected Item in the ITEM table. Return number of rows modified
    updateItem(id, newDescription, newPrice) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE ITEMS SET description = ?, price = ? WHERE id = ?;'
            this.db.run(sqlUpdate, [newDescription, newPrice, id], function (err) {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    resolve(this.changes);
                }
            });
        });
    }

// delete one or more Item from the ITEM table given different input. Return number of rows modified
    deleteItem(itemId=undefined,supplierId=undefined,skuId=undefined) {        
        let sqlInfo = {sql: undefined, values: undefined};

        if(itemId || itemId === 0) {
            const sqlDeleteFromItem = 'DELETE FROM ITEMS WHERE id = ?';
            sqlInfo.sql = sqlDeleteFromItem;
            sqlInfo.values = [itemId];
        }
        else if(supplierId) {
            const sqlDeleteFromSupplier = 'DELETE FROM ITEMS WHERE supplierId = ?';
            sqlInfo.sql = sqlDeleteFromSupplier;
            sqlInfo.values = [supplierId];
        }
        else if(skuId) {
            const sqlDeleteFromSKU = 'DELETE FROM ITEMS WHERE SKUId = ?';
            sqlInfo.sql = sqlDeleteFromSKU;
            sqlInfo.values = [skuId];
        }
        else {
            throw( new Error("No Argument Passed", 10));
        }
        
        return new Promise((resolve, reject) => {
            this.db.run(sqlInfo.sql,sqlInfo.values, function (err) {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    resolve(this.changes);
                }
            });
        });
    }

    // private method to check whether supplierId corresponds to an existing supplier
   #checkSupplier(supplierId) {
        const sql = 'SELECT id FROM users WHERE id=? AND type="supplier"'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [supplierId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
    }

    // private method to check whether skuId corresponds to an existing sku
   #checkSKU(skuId) {
        const sql = 'SELECT id FROM skus WHERE id=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
    }

    #checkConsistency(id, supplierId, skuId) {
        const sql = 'SELECT id FROM items WHERE (SKUId=? OR id=?) AND supplierId=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuId, id, supplierId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
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