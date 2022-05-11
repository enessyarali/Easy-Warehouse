'use strict';
const SkuItem = require('../model/skuItem');
const RKO = require('../model/restockOrder');
const RestockOrder = RKO.RestockOrder;
const ProductRKO = RKO.ProductRKO;

const sqlite = require('sqlite3');

class RestockOrderDBU {

    // attributes
    // - db (Database)

    // constructor
    constructor(dbname, db = undefined) {
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
    loadRestockOrder(id = undefined, state = undefined, returnItems = undefined) { //returnItems is a flag 
        const sqlInfo = { sql: undefined, values: undefined };

        if (id) {
            if (!returnItems) {
                const sqlId = 'SELECT * FROM "restock-orders" WHERE id = ?';
                sqlInfo.sql = sqlId;
                sqlInfo.values = [id];
            }
            else {
                // return an array
                if (!this.#checkState(orderId, 'COMPLETEDRETURN')) {
                    throw (new Error("Incorrect order's status. Operation aborted", 13));
                }
                const sqlReturn = 'SELECT S.SKUid as skuId, S.RFID as rfid FROM "sku-items" S, "sku-items-rko" R, "test-results" Tr WHERE R.orderId=? AND s.id = r.skuItemId AND R.skuItemId=Tr.SKUitemId AND Tr.result= Fail'
                sqlInfo.sql = sqlReturn;
                sqlInfo.values = [id]

                return new Promise((resolve, reject) => {
                    this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const skuItemArray = rows.map((si) => {
                            const sia = { SKUid: rows.skuId, rfid: rows.rfid };
                            return sia;
                        });
                        Promise.all(skuItemArray).then((skuItemArray) => resolve(skuItemArray));
                    });
                });

            }
        }
        else if (state) {
            const sqlState = 'SELECT * FROM "restock-orders" WHERE state = ?';
            sqlInfo.sql = sqlState;
            sqlInfo.values = [state];
        }
        else {
            const sqlNoInfo = 'SELECT * FROM "restock-orders"';
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
                    if (o.state !== 'DELIVERY' && o.state !== 'ISSUED') {
                        const products = await this.#getProducts(o.id);
                        const skuItems = await this.#getSkuItems(o.id);
                        order.setProducts(products);
                        order.setSkuItems(skuItems);
                    }
                    return order;
                });
                Promise.all(orders).then((orders) => resolve(orders));
            });
        });
    }

    // insert a new RestockOrder inside the RESTOCK-ORDERS table
    async insertRestockOrder(issueDate, products, supplierId, transportNote) {
        // check if supplier exist
        const isSupplier = await this.#checkSupplier(supplierId);
        if (!isSupplier)
            throw (new Error("Supplier does not exist. Operation aborted.", 6));

        const orderId = await this.#insertOrder(issueDate, supplierId, transportNote);
        const promises = products.map((p) => new Promise(async (resolve, reject) => {
            const insert = 'INSERT INTO "products-rko" (orderId, skuId, description, price, quantity) VALUES (?,?,?,?,?)';
            this.db.run(insert, [orderId, p.SKUId, p.description, p.price, p.qty], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        }));
        return Promise.all(promises);
    }

    // update a selected RestockOrder in the RESTOCK-ORDERS table. Return number of rows modified
    async updateRestockOrder(orderId, newState = undefined, newTransportNote = undefined, skuItems = undefined) {
        const sqlInfo = { sql: undefined, values: undefined }
        // check if newState exist
        if (newState) {
            sqlInfo.sql = 'UPDATE "restock-orders" SET state = ? WHERE id = ?';
            sqlInfo.values = [newState, orderId];
            //update state
            return new Promise((resolve, reject) => {
                this.db.run(sqlInfo.sql, sqlInfo.values, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    else {
                        resolve(this.changes);
                    }
                });
            });
        }
        // check if SKUitem(s) are passed
        else if (skuItems) {
            if (!this.#checkState(orderId, 'DELIVERED'))
                throw (new Error("Incorrect order's status. Operation aborted", 13));

            const ids = [];
            for (ski of skuItems) {
                // check if SKUitem exists
                const isSKUitem = await this.#checkSKUitem(ski);

                if (!isSKUitem)
                    throw (new Error("SKUitem does not exist. Operation aborted.", 9));
                // save SkuItemId and SKUid
                else
                    ids.push({ siId: isSKUitem, skId: ski.SKUId });
            }
            const promises = ids.map((i) => new Promise(async (resolve, reject) => {
                const addItem = 'INSERT INTO "sku-items-rko" (orderId, skuItemId, skuId) VALUES (?,?,?)';
                this.db.run(addItem, [orderId, i.siId, i.skId], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    } else resolve('Done');
                });
            }));
            await Promise.all(promises);
        }
        // check if newTransportNote exists
        if (newTransportNote) {
            if (!this.#checkState(orderId, 'DELIVERY'))
                throw (new Error("Incorrect order's status. Operation aborted", 13));

            sqlInfo.sql = 'UPDATE "restock-orders" SET transportNote = ? WHERE id = ?';
            sqlInfo.values = [newTransportNote, orderId];
            // update TransportNote
            return new Promise((resolve, reject) => {
                this.db.run(sqlInfo.sql, sqlInfo.values, function (err) {
                    if (err) {
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

    // delete one or more RestockOrder from the RESTOCK-ORDERS table given different input. Return number of rows modified
    async deleteRestockOrder(orderId) {
        const dependency = await this.#checkDependency(id);
        if (dependency) {
            // if there is at least 1 dependency
            throw (new Error("Dependency detected. Delete aborted.", 14));
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
        // delete from products
        promises.push(new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM "products-rko" WHERE orderId=?';
            this.db.run(sqlDelete, [orderId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        }));
        // delete from skuItem Rko
        promises.push(new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM "sku-items-rko" WHERE orderId=?';
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
            const sqlProd = 'SELECT skuId, description, price, qty FROM "products-rko" S WHERE S.orderId=?';
            this.db.all(sqlProd, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map((p) => new ProductRKO(p.skuId, p.description, p.price, p.qty ? undefined : p.qty));
                resolve(products);;
            });
        });
    }

    // private method to get skuItems for a given orderId 
    #getSkuItems(id) {
        return new Promise((resolve, reject) => {
            const sqlSKUi = 'SELECT * FROM "SKU-ITEMS" WHERE id = ?';
            this.db.all(sqlSKUi, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skuitems = rows.map((si) => new SkuItem(si.rfid, si.skuId, si.isAvailable, si.dateOfStock));
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
            });
        });
    }

    //private method to check whether the state of the Order is DELIVERED
    #checkState(orderId, status) {
        const sql = 'SELECT * FROM "restock-orders" WHERE id = ? AND state = ?';
        return new Promise((resolve, reject) => {
            this.db.get(sql, [orderId, status], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            });
        });
    }

    // private method to check whether SKUitemId corresponds to an existing SKUitem. Return skuItemId if true, false otherwise
    #checkSKUitem(skuItem) {
        const sql = 'SELECT id FROM "SKU-ITEMS" WHERE RFID=? AND SKUid = ?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuItem.RFID, skuItem.SKUId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.id : false);
            });
        });
    }

    #checkDependency(id) {
        // return-order check
        return new Promise((resolve, reject) => {
            const returnOrder = 'SELECT id FROM "return-order" WHERE restockOrderId=?';
            this.db.all(returnOrder, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!rows || rows.length == 0)
                    resolve(true);
                else resolve(false);
                return;
            });
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