'use strict';
const SKUitem = require('../model/skuItem.js');
const Error = require('../model/error')
const sqlite = require('sqlite3');

class SkuItemDBU {

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

    loadSKUitem(rfid=undefined, skuId=undefined) {

        const sqlId = 'SELECT * FROM "SKU-ITEMS" WHERE rfid=?';
        const sqlSku = 'SELECT * FROM "SKU-ITEMS" WHERE skuId=? AND available=1';
        const sqlAll = 'SELECT * FROM "SKU-ITEMS"';

        let sqlInfo = {sql: undefined, values: undefined};

        if(!rfid && !skuId) {
            // get all sku items
            sqlInfo.sql = sqlAll;
            sqlInfo.values = [];
        } else if (rfid) { 
            // get sku item by rfid
            sqlInfo.sql = sqlId;
            sqlInfo.values = [rfid];
        } else {
            // get sku items belonging to a given sku
            sqlInfo.sql = sqlSku;
            sqlInfo.values = [skuId];
        }

        return new Promise((resolve, reject) => {
            this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skuItems = rows.map((s) => {
                    const skuItem = new SKUitem(s.RFID, s.SKUId, s.Available, s.DateOfStock);
                    return skuItem;
                });
                resolve(skuItems);
            });
        });
    }

    async insertSKUitem(rfid, skuId, dateOfStock=null) {
        // check if skuId matches an existing sku
        let isSKU;
        try{
            isSKU = await this.#checkSkuId(skuId);
        } catch(err) {  // if the database access generates an exception, propagate it
            throw(err);
        }
        if(!isSKU)
            throw(new Error("Provided id does not match any SKU", 3));

        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO "SKU-ITEMS" (rfid, skuId, available, dateOfStock) VALUES(?,?,0,?)';
            this.db.run(sqlInsert, [rfid, skuId, dateOfStock], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        });
    }

    // this function returns the number of rows which has been modified
    async updateSKUitem(oldRfid, newRfid, newAvailable, newDateOfStock) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "SKU-ITEMS" SET rfid=?, available=?, dateOfStock=? WHERE rfid=?';
            this.db.run(sqlUpdate, [newRfid, newAvailable, newDateOfStock, oldRfid], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    // this function returns the number of rows which has been modified
    deleteSKUitem(rfid, skuId=undefined) {
        const sqlId = 'DELETE FROM "SKU-ITEMS" WHERE rfid=?';
        const sqlSku = 'DELETE FROM "SKU-ITEMS" WHERE skuId=?';

        let sqlInfo = {sql: undefined, values: undefined};

        if(!rfid && !skuId) {
            // unexisting behaviour
            throw(new Error("Cannot call delete without parameters", 10))
        } else if (rfid) { 
            // delete sku item by rfid
            sqlInfo.sql = sqlId;
            sqlInfo.values = [rfid];
        } else {
            // delete sku items belonging to a given sku
            sqlInfo.sql = sqlSku;
            sqlInfo.values = [skuId];
        }
        // delete other things to keep consistency - TODO
        return new Promise((resolve, reject) => {
            this.db.run(sqlInfo.sql, sqlInfo.values, function (err) {
                if (err) {
                    reject(err);
                    console.log(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    #checkSkuId(skuId) {
        return new Promise((resolve, reject) => {
            const sku = 'SELECT id FROM SKUS WHERE id=?';
            this.db.get(sku, [skuId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row ? true : undefined);
            });
        });
    }

}

module.exports = SkuItemDBU;