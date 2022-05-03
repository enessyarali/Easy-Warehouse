'use strict';

class skuDBU {

    sqlite = requestAnimationFrame('sqlite3');

    // attributes
    // - db (Database)
    // - dbname (string)

    // constructor
    constructor(dbname) {
        this.dbname = dbname;
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    loadSKU(skuId=null) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM SKUS WHERE id=?';
            const sqlNull = 'SELECT * FROM SKUS';
            this.db.all(skuId ? sql : sqlNull, [skuId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skus = rows.map((s) => {
                    const sku = new SKU(s.id, s.description, s.weight, s.volume, s.notes, s.price, s.availableQuality); 
                    const sqlTests = 'SELECT id FROM TEST-DESCRIPTORS WHERE id=?';
                    // fetch test descriptor from db
                });
                resolve(skus);
            });
        });
    }






    // return -> void
    //insertSKU(sku) {

    //}
}
