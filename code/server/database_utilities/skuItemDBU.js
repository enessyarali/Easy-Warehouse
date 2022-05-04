'use strict';
const SKUitem = require('../model/skuItem.js');

const sqlite = require('sqlite3');

class SkuItemDBU {

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

    loadSKUitem(rfid=undefined, skuId=undefined) {

        const sqlId = 'SELECT * FROM "SKU-ITEMS" WHERE rfid=?';
        const sqlSku = 'SELECT * FROM "SKU-ITEMS" WHERE skuId=?';
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
                const skuItems = rows.map(async (s) => {
                    const skuItem = new SKUitem(s.rfid, s.skuId, s.Available, s.DateOfStock);
                    return skuItem;
                });
                resolve(skuItems);
            });
        });
    }
///////////////////////////////// TODO //////////////////////////////////////////

    // return -> void
    insertSKUitem(rfid, skuId, ) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO SKUS (description, weight, volume, notes, price, availableQuantity) VALUES(?,?,?,?,?,?)';
            this.db.run(sqlInsert, [description, weight, volume, notes, price, availableQuantity], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        });
    }

    // this function returns the number of rows which has been modified
    updateSKU(sku) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE SKUS SET description=?, weight=?, volume=?, notes=?, price=?, availableQuantity=? WHERE id=?';
            this.db.run(sqlUpdate, [sku.description, sku.weight, sku.volume, sku.notes, sku.price, sku.availableQuantity, sku.id], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    deleteSKU(id) {
        // delete other things to keep consistency - TODO
        return new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM SKUS WHERE id=?';
            this.db.run(sqlDelete, [id], function (err) {
                if (err) {
                    reject(err);
                    console.log(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    // private method to get test descriptors for a given skuId 
   #getTestDescriptors(id) {
        return new Promise((resolve, reject) => {
            const test = 'SELECT id FROM "TEST-DESCRIPTORS" WHERE idSKU=?';
            this.db.all(test, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const tests = rows.map((t) => t.id);
            resolve(tests);;
            });
        });
   }

    
}

module.exports = SkuItemDBU;