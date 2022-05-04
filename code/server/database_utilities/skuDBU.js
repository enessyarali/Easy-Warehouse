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

        const sqlSku = 'SELECT * FROM SKUS WHERE id=?';
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
                    const sku = new SKU(s.id, s.description, s.weight, s.volume, s.notes, s.position, s.price, s.availableQuantity);
                    const tests = await this.#getTestDescriptors(s.id);
                    sku.setTestDescriptors(tests);
                    return sku;
                });
                Promise.all(skus).then((skus) => resolve(skus));
            });
        });
    }

    // return -> void
    /*
    insertSKU(sku) {
        return new Promise((resolve, reject) => {
            const create = 'CREATE TABLE IF NOT EXISTS skus ( id INTEGER NOT NULL, description TEXT NOT NULL, weight INTEGER NOT NULL, volume INTEGER NOT NULL, notes TEXT NOT NULL, position TEXT, availableQuantity INTEGER NOT NULL, price REAL NOT NULL, PRIMARY KEY(id AUTOINCREMENT)';
            const insert = 'INSERT INTO skus ( description, weight, volume, notes, price, availableQuantity) VALUES(?,?,?,?,?,?)';
            this.db.all(skuId!==null ? sql : sqlNull, skuId!==null ? [skuId] : [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skus = rows.map((s) => {
                    const sku = new SKU(s.id, s.description, s.weight, s.volume, s.notes, s.position, s.price, s.availableQuality);
                    // const sqlTests = 'SELECT id FROM TEST-DESCRIPTORS WHERE skuId=?';
                    // fetch test descriptors from db
                    // this.db.all(sqlTests, [s.id])
                    return sku;
                });
                resolve(skus);
            });
        });

    }*/


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