'use strict';
const RTO = require('../model/returnOrder');
const ReturnOrder = RTO.ReturnOrder;
const ProductRTO = RTO.ProductRTO;
const Error = require('../model/error');

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
                const orders = rows.map(async (o) => {
                    const order = new ReturnOrder(o.id, o.returnDate, o.restockOrderId);
                    const products = await this.#getProducts(o.id);
                    order.setProducts(products);
                    return order;
                });
                Promise.all(orders).then((orders) => resolve(orders));
            });
        });
    }

// insert a new ReturnOrder inside the RETURN-ORDERS table
    async insertReturnOrder(returnDate, products, restockOrderId) {
        // check if restockOrder exist
        const isRestockOrder = await this.#checkRestockOrder(restockOrderId);
        if (!isRestockOrder)
            throw(new Error("RestockOrder does not exist. Operation aborted.", 12));

        const orderId = await this.#insertOrder(returnDate, restockOrderId);
        const promises = products.map((p) => new Promise(async (resolve, reject) => {
            const skuItemId = await this.#checkSKUitem(p.rfid, p.SKUId);
            const insert = 'INSERT INTO "products-rto" (orderId, skuId, description, price, skuItemId) VALUES (?,?,?,?,?)';
            this.db.run(insert, [orderId, p.SKUId, p.description, p.price, skuItemId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        }));
        return Promise.all(promises);
    }

// delete one or more ReturnOrder from the RETURN-ORDERS table given different input. Return number of rows modified
    deleteReturnOrder(orderId) {
        const promises = [];
        // delete from internal orders
        promises.push(new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM "return-orders" WHERE id=?';
            this.db.run(sqlDelete, [orderId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        }));
        // delete from products rto
        promises.push(new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM "products-rto" WHERE orderId=?';
            this.db.run(sqlDelete, [orderId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        }));
        return Promise.all(promises);
    }

    // private method to get products for a given orderId 
    #getProducts(id) {
        return new Promise((resolve, reject) => {
            const sqlProd = 'SELECT skuId, description, price, skuItemId FROM "products-rto" orderId=?';
            this.db.all(sqlProd, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map(async (p) => {
                    rfId = await this.#retriveRFID(p.skuItemId);
                    new ProductRTO(p.skuId, p.description, p.price, rfid ? null : rfid)});
                resolve(products);;
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

    // private method to insert an order in the relative table. It returns the assigned orderID.
    #insertOrder(returnDate, restockOrderId) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO "return-orders" (returnDate, customerId) VALUES(?,?)';
            this.db.run(sqlInsert, [returnDate, restockOrderId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.lastID);
            });
        });
    }

    #checkSKUitem(RFiD, SKUId) {
        const sql = 'SELECT id FROM "SKU-ITEMS" WHERE RFID=? AND SKUid = ?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [RFiD, SKUId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.id : false);
            });
        });
    }
    
    #retriveRFID(skuItemId) {
        const sql = 'SELECT RFID AS rfid FROM "SKU-ITEMS" WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuItemId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.id : false);
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