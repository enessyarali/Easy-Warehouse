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

    insertRestockOrder(restockOrder) {
        return new Promise((resolve,reject) => {
            const sqlCreate = 'CREATE TABLE IF NOT EXISTS "RESTOCK-ORDERS" ( id INTEGER NOT NULL, issueDate DATE NOT NULL, state VARCHAR(20) NOT NULL, products TEXT NOT NULL, supplierId INTEGER NOT NULL, transportNote TEXT NOT NULL, skuItems TEXT NOT NULL, PRIMARY KEY(id AUTOINCREMENT))';
            this.db.all(sqlCreate, [], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve('Done');
            });
            const sqlInsert = 'INSERT INTO "RESTOCK-ORDERS"(issueDate,state,products,supplierId,transportNote,skuItems) VALUES(?,?,?,?,?,?)';
            this.db.all(sqlInsert, [restockOrder.issueDate, restockOrder.state,restockOrder.products, restockOrder.supplierId, restockOrder.transportNote, restockOrder.skuItems], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                else resolve('Done');
            });
        });
    }

    updateRestockOrder(restockOrder) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "RESTOCK-ORDERS" SET issueDate = ?, state = ?, products = ?, supplierId = ?, transportNote = ?, skuItem = ? WHERE id = ?';
            this.db.all(sqlUpdate, [restockOrder.issueDate, restockOrder.state, restockOrder.products, restockOrder.supplierId, restockOrder.transportNote, restockOrder.skuItems, restockOrder.id], function (err) {
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
            this.db.all(sqlDelete,[orderId], function (err) {
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
            this.db.all('SELECT * FROM "RETURN-ORDERS" WHERE RestockOrderId = ?', [orderId], (err, rows) => {
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