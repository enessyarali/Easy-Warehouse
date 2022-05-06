'use strict';
const SKU = require('../model/sku.js');

const sqlite = require('sqlite3');

class SkuDBU {

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

    loadSKU(skuId=undefined) {

        const sqlSku = 'SELECT * FROM SKUS WHERE id=?'; // add join on position
        const sqlAll = 'SELECT * FROM SKUS';

        let sqlInfo = {sql: undefined, values: undefined};

        if(!skuId) {
            // get all skus
            sqlInfo.sql = sqlAll;
            sqlInfo.values = [];
        } else {
            // get sku by id
            sqlInfo.sql = sqlSku;
            sqlInfo.values = [skuId];
        }

        return new Promise((resolve, reject) => {
            this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skus = rows.map(async (s) => {
                    const sku = new SKU(s.id, s.description, s.weight, s.volume, s.notes, pos, s.price, s.availableQuantity);
                    const tests = await this.#getTestDescriptors(s.id);
                    sku.setTestDescriptors(tests);
                    return sku;
                });
                Promise.all(skus).then((skus) => resolve(skus));
            });
        });
    }

    // return -> void
    insertSKU(description, weight, volume, notes, price, availableQuantity) {
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

module.exports = SkuDBU;