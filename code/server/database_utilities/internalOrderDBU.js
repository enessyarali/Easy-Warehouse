'use strict';
const IO = require('../model/internalOrder');
const InternalOrder = IO.InternalOrder;
const ProductIO = IO.ProductIO;

const Error = require('../model/error')

const sqlite = require('sqlite3');

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
        const promises = products.map((p) => new Promise((resolve, reject) => {
            const insert = 'INSERT INTO "products-sku-io" (orderId, skuId, description, price, qty) VALUES (?,?,?,?,?)';
            this.db.run(insert, [orderId, p.skuId, p.description, p.price, p.qty], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        }));
        return Promise.all(promises);
    }

    /////////////////////////////// TO DO ///////////////////////////////////////////

    // this function returns the number of rows which has been modified
    async updateSKU(sku) {
        // get position, if defined
        let posId = sku.position;
        if (sku.position) {
            posId = await this.#getPositionIncrementalId(sku.position);
        }
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE SKUS SET description=?, weight=?, volume=?, notes=?, price=?, availableQuantity=?, position=? WHERE id=?';
            this.db.run(sqlUpdate, [sku.description, sku.weight, sku.volume, sku.notes, sku.price, sku.availableQuantity, posId, sku.id], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    deleteSKU(id) {
        // delete other things to keep consistency - TODO
        return new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM SKUS WHERE id=?';
            this.db.run(sqlDelete, [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    // private method to get products for a given orderId 
   #getProducts(id) {
        return new Promise((resolve, reject) => {
            const sqlProd = 'SELECT S.skuId AS skuId, S.description AS description, S.price AS price, S.qty AS qty, SI.RFID AS rfid FROM "products-sku-io" S LEFT JOIN "products-rfid-io" R ON (S.orderId = R.orderId AND S.skuId = R.skuId) LEFT JOIN "sku-items" SI ON R.skuItemId = SI.id WHERE S.orderId=?';
            this.db.all(sqlProd, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const products = rows.map((p) => new ProductIO(p.skuId, p.description, p.price, p.rfid ? null : p.qty, p.rfid));
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

   // private method to insert an order in the relative table. It returns the assigned orderID.
   #insertOrder(issueDate, customerId) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO "internal-orders" (issueDate, state, customerId) VALUES(?,"issued",?)';
            this.db.run(sqlInsert, [issueDate, customerId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.lastID);
            });
        });
   }

    
}

module.exports = InternalOrderDBU;