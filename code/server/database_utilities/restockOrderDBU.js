'use strict';
const RKO = require('../model/restockOrder');
const RestockOrder = RKO.RestockOrder;
const ProductRKO = RKO.ProductRKO;
const Error = require('../model/error');

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
    loadRestockOrder(id = undefined, state = undefined) {
        const sqlInfo = { sql: undefined, values: undefined };

        if (id) {
            const sqlId = 'SELECT * FROM "restock-orders" WHERE id = ?';
            sqlInfo.sql = sqlId;
            sqlInfo.values = [id];    
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

    // fetches from the database all items which should be returned
    async selectReturnItems(id) {
        // return an array
        return new Promise((resolve, reject) => {
            const sql = 'SELECT S.SKUid AS skuId, S.RFID AS rfid FROM "sku-items-rko" R JOIN "sku-items" S ON S.id = R.skuItemId \
                WHERE R.orderId=? AND NOT EXISTS ( \
                    SELECT TR.id \
                    FROM "test-results" TR \
                    WHERE S.id = TR.SKUitemId AND TR.result = "Pass" \
                )';
            this.db.all(sql, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const skuItemArray = rows.map((si) => {
                    const sia = { SKUid: si.skuId, rfid: si.rfid };
                    return sia;
                });
                Promise.all(skuItemArray).then((skuItemArray) => resolve(skuItemArray));
            });
        });
    }

    // insert a new RestockOrder inside the RESTOCK-ORDERS table
    async insertRestockOrder(issueDate, products, supplierId) {
        // check if supplier exist
        const isSupplier = await this.#checkSupplier(supplierId);
        if (!isSupplier)
            throw (new Error("Supplier does not exist. Operation aborted.", 6));

        const orderId = await this.#insertOrder(issueDate, supplierId);
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

    // modify the state for a restock order
    patchRestockOrderState(orderId, newState) {
        const sql = 'UPDATE "restock-orders" SET state = ? WHERE id = ?';
        //update state
        return new Promise((resolve, reject) => {
            this.db.run(sql, [newState, orderId], function (err) {
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

    // add new sku items a restock order
    async patchRestockOrderSkuItems(orderId, skuItems) {
        // check if the order status is correct
        const ids = [];
        for (let ski of skuItems) {
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
        return Promise.all(promises);
    }

    // add new transport note to restock order
    async patchRestockOrderTransportNote(orderId, newTransportNote) {
        const sql = 'UPDATE "restock-orders" SET transportNote = ? WHERE id = ?';
        // update TransportNote
        return new Promise((resolve, reject) => {
            this.db.run(sql, [JSON.stringify(newTransportNote), orderId], function (err) {
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
    
    // delete one or more RestockOrder from the RESTOCK-ORDERS table given different input. Return number of rows modified
    async deleteRestockOrder(orderId) {
        const dependency = await this.#checkDependency(orderId);
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

    // method to check whether the state of the Order corresponds to the correct one
    retriveState(orderId) {
        const sql = 'SELECT state AS state FROM "restock-orders" WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.db.get(sql, [orderId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.state : undefined);
            });
        });
    }

    // private method to get products for a given orderId 
    #getProducts(orderId) {
        return new Promise((resolve, reject) => {
            const sqlProd = 'SELECT skuId, description, price, quantity FROM "products-rko" S WHERE S.orderId=?';
            this.db.all(sqlProd, [orderId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const products = rows.map((p) => new ProductRKO(p.skuId, p.description, p.price, p.quantity));
                resolve(products);;
            });
        });
    }

    // private method to get skuItems for a given orderId 
    #getSkuItems(orderId) {
        return new Promise((resolve, reject) => {
            const sqlSKUi = 'SELECT S.SKUId as SKUId, S.RFID as rfid FROM "SKU-ITEMS" S JOIN "sku-items-rko" R ON R.SKUitemId=S.id WHERE R.orderId = ?';
            this.db.all(sqlSKUi, [orderId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    // private method to insert an order in the relative table. It returns the assigned orderID.
    #insertOrder(issueDate, supplierId) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO "restock-orders" (issueDate, state, supplierId) VALUES(?,"ISSUED",?)';
            this.db.run(sqlInsert, [issueDate, supplierId], function (err) {
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

    // private method to check whether SKUitemId corresponds to an existing SKUitem. Return skuItemId if true, false otherwise
    #checkSKUitem(skuItem) {
        const sql = 'SELECT id FROM "SKU-ITEMS" WHERE RFID=? AND SKUid = ?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuItem.rfid, skuItem.SKUId], (err, row) => {
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
            const returnOrder = 'SELECT id FROM "return-orders" WHERE restockOrderId=?';
            this.db.all(returnOrder, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!rows || rows.length == 0)
                    resolve(false);
                else resolve(true);
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