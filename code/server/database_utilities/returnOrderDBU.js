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

    insertReturnOrder(returnDate, products, restockOrderId) {
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

}
module.exports = ReturnOrderDBU;

/* 
id
returnDate
products
restockOrderId
*/