'use strict';
const IO = require('../model/internalOrder');
const InternalOrder = IO.InternalOrder;
const ProductIO = IO.ProductIO;

const Error = require('../model/error')

const sqlite = require('sqlite3');

// IMPORTANT!
// some complex checks cannot be performed due to the non-atomicity of the database operations.
// we assume that the client structure will take care of them by means of the provided APIs.

class InternalOrderDBU {

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

    loadInternalOrder(orderId=undefined, state=undefined) {

        const sqlId = 'SELECT * FROM "internal-orders" WHERE id=?'
        const sqlAll = 'SELECT * FROM "internal-orders"'
        const sqlState = 'SELECT * FROM "internal-orders" WHERE state=?'

        let sqlInfo = {sql: undefined, values: undefined};

        if(!orderId && !state) {
            // get all orders
            sqlInfo.sql = sqlAll;
            sqlInfo.values = [];
        } else if (orderId) {
            // get orders by id
            sqlInfo.sql = sqlId;
            sqlInfo.values = [orderId];
        } else {
            // get orders by state
            sqlInfo.sql = sqlState;
            sqlInfo.values = [state];
        }

        return new Promise((resolve, reject) => {
            this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const orders = rows.map(async (o) => {
                    const order = new InternalOrder(o.id, o.issueDate, o.state, o.customerId)
                    const products = await this.#getProducts(o.id);
                    order.setProducts(products);
                    return order;
                });
                Promise.all(orders).then((orders) => resolve(orders));
            });
        });
    }

    // return -> void
    async insertInternalOrder(issueDate, products, customerId) {
        // fisrt, check whether the customer exists
        const foundCustomer = await this.#checkCustomer(customerId);
        if (!foundCustomer) {
            throw(new Error("The provided id does not match any customer.", 6));
        }
        // then, insert the order record in internal-orders table
        const orderId = await this.#insertOrder(issueDate, customerId);
        const prod = [].concat(products);
        const promises = prod.map((p) => new Promise(async (resolve, reject) => {
            const insert = 'INSERT INTO "products-sku-io" (orderId, skuId, description, price, qty) VALUES (?,?,?,?,?)';
            this.db.run(insert, [orderId, p.SKUId, p.description, p.price, p.qty], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        }));
        return Promise.all(promises);
    }

    // this function returns the number of rows which have been modified
    async updateInternalOrder(orderId, newState, products=undefined) {
        if(newState=="COMPLETED") {
            const prod = [].concat(products);
            const promises = prod.map((p) => new Promise(async (resolve, reject) => {
                // check whether the RFID belongs to the specified skuId AND if the skuId belongs to the order
                const skuItemId = await this.#checkSkuItemConsistency(orderId, p.SkuID, p.RFID);
                const addRfid = 'INSERT INTO "products-rfid-io" (orderId, skuId, skuItemId) VALUES (?,?,?)';
                this.db.run(addRfid, [orderId, p.SkuID, skuItemId], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    } else resolve('Done');
                });
            }));
            await Promise.all(promises);
        }
        // finally, update the main table
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "internal-orders" SET state=? WHERE id=?';
            this.db.run(sqlUpdate, [newState, orderId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    deleteInternalOrder(orderId) {
        // internal orders are not referenced by anything, hence we don't need to check for consistency
        const promises = [];
        // delete from internal orders
        promises.push(new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM "internal-orders" WHERE id=?';
            this.db.run(sqlDelete, [orderId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        }));
        // delete from producs sku
        promises.push(new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM "products-sku-io" WHERE orderId=?';
            this.db.run(sqlDelete, [orderId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        }));
        // delete from products rfid
        promises.push(new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM "products-rfid-io" WHERE orderId=?';
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
            const sqlProd = 'SELECT S.skuId AS skuId, S.description AS description, S.price AS price, S.qty AS qty, \
                SI.RFID AS rfid FROM "products-sku-io" S LEFT JOIN "products-rfid-io" R ON (S.orderId = R.orderId AND S.skuId = R.skuId) \
                LEFT JOIN "sku-items" SI ON R.skuItemId = SI.id WHERE S.orderId=?';
            this.db.all(sqlProd, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const products = rows.map((p) => new ProductIO(p.skuId, p.description, p.price, p.qty, p.rfid));
            resolve(products);;
            });
        });
   }

   // private method to check whether customerId corresponds to an existing customer
   #checkCustomer(customerId) {
        const sql = 'SELECT id FROM users WHERE id=? AND type="customer"'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [customerId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
   }

   #checkSKU(skuId) {
        const sql = 'SELECT id FROM skus WHERE id=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                console.log(row);
                resolve(row ? true : false);
            })
        });
   }

   // private method to insert an order in the relative table. It returns the assigned orderID.
   #insertOrder(issueDate, customerId) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO "internal-orders" (issueDate, state, customerId) VALUES(?,"ISSUED",?)';
            this.db.run(sqlInsert, [issueDate, customerId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.lastID);
            });
        });
   }

   // private method to check consistency order-skuItem
   #checkSkuItemConsistency(orderId, skuId, rfid) {
        return new Promise((resolve, reject) => {
            const sqlConst = 'SELECT SI.id AS id FROM "sku-items" SI JOIN "products-sku-io" S ON SI.SKUId = S.skuId WHERE S.orderId = ? \
                AND SI.RFID = ? AND SI.SKUId = ?';
            this.db.get(sqlConst,[orderId, rfid, skuId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row? row.id : false);;
            });
        });
   }

    
}

module.exports = InternalOrderDBU;