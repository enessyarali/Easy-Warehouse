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

    insertRestockOrder(issueDate, state, products, supplierId, transportNote, skuItems) {
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

    updateRestockOrder(issueDate, state, products, supplierId, transportNote, skuItems) {
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