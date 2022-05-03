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

    loadSKU(skuId=null) {
        return new Promise((resolve, reject) => {
            //const sql = 'SELECT * FROM SKUS WHERE id=?';
            const sqlNull = 'SELECT * FROM skus';
            //this.db.all(skuId!==null ? sql : sqlNull, skuId!==null ? [skuId] : [], (err, rows) => {
            this.db.all(sqlNull, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skus = rows.map((s) => {
                    const sku = new SKU(s.id, s.description, s.weight, s.volume, s.notes, s.price, s.availableQuality);
                    // const sqlTests = 'SELECT id FROM TEST-DESCRIPTORS WHERE id=?';
                    // fetch test descriptor from db
                    return sku;
                });
                resolve(skus);
            });
        });
    }


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




    // return -> void
    //insertSKU(sku) {

    //}
}

module.exports = SkuDBU;