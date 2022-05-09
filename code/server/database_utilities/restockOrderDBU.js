'use strict';
const RKO = require('../model/restockOrder');
const SkuItem = require('../model/skuItem');
const RestockOrder = RKO.RestockOrder;
const ProductIO = RKO.ProductIO;
const returnOrderDBU = require('./returnOrderDBU.js');

const sqlite = require('sqlite3');
const { ReturnOrder } = require('../model/returnOrder');

class RestockOrderDBU {

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
            return new Promise((resolve, reject) => {
                this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const orders = rows.map(async (o) => {
                        const order = new RestockOrder(o.id, o.issueDate, o.state, o.supplierId, o.transportNote);
                        const products = await this.#getProducts(o.id);
                        const skuItems = await this.#getSkuItems(o.id);
                        order.setProducts(products);
                        order.setSkuItems(skuItems);
                        return order;
                    });
                    Promise.all(orders).then((orders) => resolve(orders));
                });
            });
        }

// insert a new RestockOrder inside the RESTOCK-ORDERS table
    async insertRestockOrder(issueDate, products, supplierId, transportNote, skuItems) {
        // check if supplier exist
        const isSupplier = await this.#checkSupplier(supplierId);
        if (!isSupplier)
            throw(new Error("Supplier does not exist. Operation aborted.", 6));

        // check if SKUitem exists
        const isSKUitem = await this.#checkSKUitem(SKUitemRFid);
        if (!isSKUitem)
            throw(new Error("SKUitem does not exist. Operation aborted.", 9));

        const promises = [];
        const orderId = await this.#insertOrder(issueDate, supplierId, transportNote);

        promises.push(products.map((p) => new Promise(async (resolve, reject) => {
            const insert = 'INSERT INTO "products-sku-io" (orderId, skuId, description, price, qty) VALUES (?,?,?,?,?)';
            this.db.run(insert, [orderId, p.SKUId, p.description, p.price, p.qty], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        })));

        promises.push(skuItems.map((s) => new Promise(async (resolve, reject) => {
            //da fare
        })));
        return Promise.all(promises);
    }

// update a selected RestockOrder in the RESTOCK-ORDERS table. Return number of rows modified
    async updateRestockOrder(orderId, issueDate, newState, products, supplierId, transportNote, skuItems) {
        // check if supplier exist
        const isSupplier = await this.#checkSupplier(supplierId);
        if (!isSupplier)
            throw(new Error("Supplier does not exist. Operation aborted.", 6));

        // check if SKUitem exists
        const isSKUitem = await this.#checkSKUitem(SKUitemRFid);
        if (!isSKUitem)
            throw(new Error("SKUitem does not exist. Operation aborted.", 9));

        if(newState=="completed") {
            const promises = products.map((p) => new Promise(async (resolve, reject) => {
                // check whether the RFID belongs to the specified skuId AND if the skuId belongs to the order
                const skuItemId = await this.#checkSkuItemConsistency(orderId, p.SkuID, p.RFID);
                // if (!skuItemId)
                //    throw(new Error("Detected inconsistency SKUitem-RFID. Operation aborted.",7));
                // add the new record for the RFID
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
        
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "RESTOCK-ORDERS" SET issueDate = ?, state = ?, supplierId = ?, transportNote = ?, WHERE id = ?';
            this.db.run(sqlUpdate, [issueDate, newState, supplierId, transportNote, id], function (err) {
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
            const ids = await this.#getReturnId(orderId);
            const rs = new ReturnOrder(); //??
            for (let i of ids) {
                await rs.deleteReturnOrder(i); //??
            }

            const promises = [];
            // delete from restock orders
            promises.push(new Promise((resolve, reject) => {
                const sqlDelete = 'DELETE FROM "restock-orders" WHERE id=?';
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

    // private method to get skuitems for a given orderId 
    #getSkuItems(id) {
        return new Promise((resolve, reject) => {
            const sqlProd = '';//da fare 
            this.db.all(sqlProd, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skuitems = rows.map((p) => new SkuItem(p.rfid, p.skuId, p.isAvailable, p.dateOfStock));
                resolve(skuitems);;
            });
        });
    }

    // private method to insert an order in the relative table. It returns the assigned orderID.
    #insertOrder(issueDate, supplierId, transportNote) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO "restock-orders" (issueDate, state, supplierId,transportNote) VALUES(?,"ISSUED",?,?)';
            this.db.run(sqlInsert, [issueDate, supplierId, transportNote], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.lastID);
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
module.exports = RestockOrderDBU;

/* 
id
issueDate
state
products
supplierId
transportNote
skuItems
*/