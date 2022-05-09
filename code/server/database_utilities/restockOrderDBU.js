'use strict';
const RESTOCKORDER = require('../model/restockOrder.js');
const returnOrderDBU = require('./returnOrder.js');

const sqlite = require('sqlite3');

class restockOrderDBU {

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

// get RestockOrder(s) from the RESTOCK-ORDERS table and return it/them as a RestockOrder object
    loadRestockOrder(id=undefined, state=undefined) {
        return new Promise((resolve, reject) => {
            const sqlInfo = {sql: undefined, values: undefined};

            if(id) {
                const sqlId = 'SELECT * FROM "RESTOCK-ORDERS" WHERE id = ?';
                sqlInfo.sql = sqlId;
                sqlInfo.values = [id];
            }
            else if(state) {
                const sqlState = 'SELECT * FROM "RESTOCK-ORDERS" WHERE state = ?';
                sqlInfo.sql = sqlState;
                sqlInfo.values = [state];
            }
            else{
                const sqlNoInfo = 'SELECT * FROM "RESTOCK-ORDERS"';
                sqlInfo.sql = sqlNoInfo;
                sqlInfo.values = [];
            }

            this.db.all(sqlInfo.sql, sqlInfo.values, (err,rows) => {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    const restocks = rows.map((rk) => {
                        const restock = new RESTOCKORDER(rk.id, rk.issueDate, rk.state, rk.products, rk.supplierId, rk.transportNote, rk.skuItems);
                        return restock;
                    });
                    resolve(restocks);
                }
            });
        });
    }

// insert a new RestockOrder inside the RESTOCK-ORDERS table
    async insertRestockOrder(issueDate, state, products, supplierId, transportNote, skuItems) {
        // check if supplier exist
        const isSupplier = await this.#checkSupplier(supplierId);
        if (!isSupplier)
            throw(new Error("Supplier does not exist. Operation aborted.", 6));

        // check if SKUitem exists
        const isSKUitem = await this.#checkSKUitem(SKUitemRFid);
        if (!isSKUitem)
            throw(new Error("SKUitem does not exist. Operation aborted.", 9));

        return new Promise((resolve,reject) => {
            const sqlInsert = 'INSERT INTO "RESTOCK-ORDERS"(issueDate,state,products,supplierId,transportNote,skuItems) VALUES(?,?,?,?,?,?)';
            this.db.all(sqlInsert, [issueDate, state, products, supplierId, transportNote, skuItems], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                else resolve('Done');
            });
        });
    }

// update a selected RestockOrder in the RESTOCK-ORDERS table. Return number of rows modified
    async updateRestockOrder(issueDate, state, products, supplierId, transportNote, skuItems) {
        // check if supplier exist
        const isSupplier = await this.#checkSupplier(supplierId);
        if (!isSupplier)
            throw(new Error("Supplier does not exist. Operation aborted.", 6));

        // check if SKUitem exists
        const isSKUitem = await this.#checkSKUitem(SKUitemRFid);
        if (!isSKUitem)
            throw(new Error("SKUitem does not exist. Operation aborted.", 9));

        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "RESTOCK-ORDERS" SET issueDate = ?, state = ?, products = ?, supplierId = ?, transportNote = ?, skuItem = ? WHERE id = ?';
            this.db.run(sqlUpdate, [issueDate, state, products, supplierId, transportNote, skuItems, id], function (err) {
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
// delete one or more RestockOrder from the RESTOCK-ORDERS table given different input. Return number of rows modified
    async deleteRestockOrder(orderId) {
            const sqlDelete = 'DELETE FROM "RESTOCK-ORDERS" WHERE id = ?';
            const ids = await this.#getReturnId(orderId);
            for (let i of ids) {
                await this.db.deleteReturnOrder(i);
            }

        return new Promise((resolve, reject) => {
            this.db.run(sqlDelete,[orderId], function (err) {
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
    
    //private method that get ReturnOrder'Id given an orderId
    #getReturnId(orderId){
        return new Promise((resolve, reject) => {
            this.db.run('SELECT * FROM "RETURN-ORDERS" WHERE RestockOrderId = ?', [orderId], (err, rows) => {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    const ids = rows.map((ro) => {
                        const id = ro.id;
                        return id;
                    });
                    resolve(ids);
                }
            });
        }); 
    }

    // private method to check whether supplierId corresponds to an existing supplier
    #checkSupplier(supplierId) {
        const sql = 'SELECT id FROM users WHERE id=? AND type="supplier"'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [supplierId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
    }

    // private method to check whether SKUitemId corresponds to an existing SKUitem
    #checkSKUitem(skuItemRFid) {
        const sql = 'SELECT id FROM "SKU-ITEMS" WHERE RFID=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuItemRFid], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
    }

}
module.exports = restockOrderDBU;

/* 
id
issueDate
state
products
supplierId
transportNote
skuItems
*/