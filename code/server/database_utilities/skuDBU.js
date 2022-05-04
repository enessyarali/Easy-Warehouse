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
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM SKUS WHERE id=?';
            const sqlNull = 'SELECT * FROM skus';
            this.db.all(skuId ? sql : sqlNull, skuId ? [skuId] : [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skus = rows.map((s) => {
                    const sku = new SKU(s.id, s.description, s.weight, s.volume, s.notes, s.position, s.price, s.availableQuality);
                    // const sqlTests = 'SELECT id FROM TEST-DESCRIPTORS WHERE skuId=?';
                    // fetch test descriptors from db
                    // this.db.all(sqlTests, [s.id], )
                    return sku;
                });
                resolve(skus);
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


    /*
    CREATE TABLE "SKUS" (
	"id"	INTEGER NOT NULL,
	"description"	TEXT NOT NULL,
	"weight"	INTEGER NOT NULL,
	"volume"	INTEGER NOT NULL,
	"notes"	TEXT NOT NULL,
	"position"	TEXT,
	"availableQuantity"	INTEGER NOT NULL,
	"price"	REAL NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
)
    */




    
}

module.exports = SkuDBU;