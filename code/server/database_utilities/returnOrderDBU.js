'use strict';
const RETURNORDER = require('../model/returnOrder.js');

const sqlite = require('sqlite3');

class ReturnOrderDBU {

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

// get ReturnOrder(s) from the RETURN-ORDERS table and return it/them as a ReturnOrder object
    loadReturnOrder(orderId = undefined) {
        return new Promise((resolve, reject) => {
            const sqlInfo = {sql: undefined, values: undefined};

            if(orderId) {
                const sqlOrderId = 'SELECT * FROM "RETURN-ORDERS" WHERE id = ?';
                sqlInfo.sql = sqlOrderId;
                sqlInfo.values = [orderId];
            }
            else {
                const sqlNoOrderId = 'SELECT * FROM "RETURN-ORDERS"';
                sqlInfo.sql = sqlNoOrderId;
                sqlInfo.values = [];
            }

            this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    const returns = rows.map((rs) => {
                        const ret = new RETURNORDER(rs.id, rs.returnDate, rs.products, rs.restockOrderId);
                        return ret;
                    });
                    resolve(returns);
                }
            });
        });
    }

// insert a new ReturnOrder inside the RETURN-ORDERS table
    async insertReturnOrder(returnDate, products, restockOrderId) {
        // check if restockOrder exist
        const isRestockOrder = await this.#checkRestockOrder(restockOrderId);
        if (!isRestockOrder)
            throw(new Error("RestockOrder does not exist. Operation aborted.", 12));

        return new Promise((resolve,reject) => {
            const sqlInsert = 'INSERT INTO "RETURN-ORDERS"(returnDate, products, restockOrderId) VALUES(?,?,?)';
            this.db.all(sqlInsert, [returnDate, products, restockOrderId], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                else resolve('Done');
            });
        });
    }

// delete one or more ReturnOrder from the RETURN-ORDERS table given different input. Return number of rows modified
    deleteReturnOrder(orderId) {
        return new Promise((resolve, reject) => {
            const sqlDeleteFromOrderId = 'DELETE FROM "RETURN-ORDERS" WHERE id = ?';
            this.db.run(sqlDeleteFromOrderId,[orderId], function (err) {
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

    // private method to check whether RestockOrderId corresponds to an existing RestockOrder
    #checkRestockOrder(restockOrderId) {
        const sql = 'SELECT id FROM "RESTOCK-ORDERS" WHERE id=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [restockOrderId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
    }
}
module.exports = ReturnOrderDBU;

/* 
id
returnDate
products
restockOrderId
*/