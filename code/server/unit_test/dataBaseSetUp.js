'use strict';

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('ezwh.db', (err) => {
    if (err) throw err;
});

exports.prepareTable = async () => {
    await fillTable();
}

exports.resetTable = async () => {
    await cleanTable();
}

exports.voidRestockOrder = async () => {
    await cleanRestockOrder();
    await cleanProductRko();
    await cleanSkuItemRko();
    await cleanReturnOrder();

    await resetRestockOrder();
    await resetProductRko();
    await resetSkuItemRko();
    await resetReturnOrder();
}

exports.voidReturnOrder = async () => {
    await cleanReturnOrder();
    await cleanProductRto();

    await resetReturnOrder();
    await resetProductRto();
}

exports.voidInternalOrder = async () => {
    await cleanInternalOrder();
    await cleanProductSkuIO();
    await cleanProductRfidIO();

    await resetInternalOrder();
    await resetProductSkuIO();
    await resetProductRfidIO();
}

exports.voidTestResult = async () => {
    await cleanTestResult();

    await resetTestResult();
}

exports.voidItem = async () => {
    await cleanItem();

    await resetItem();
}

exports.voidUser = async () => {
    await cleanUser();

    await resetUser();
}

//empty db
async function cleanTable() {
    //delete all the elements of the table
    await cleanSku();
    await cleanSkuItem();
    await cleanRestockOrder();
    await cleanProductRko();
    await cleanSkuItemRko();
    await cleanTestDescriptor();
    await cleanTestResult();
    await cleanReturnOrder();
    await cleanProductRto();
    await cleanInternalOrder();
    await cleanProductSkuIO();
    await cleanProductRfidIO();
    await cleanItem();
    await cleanUser();

    //reset the autoincrement
    await resetSku();
    await resetSkuItem();
    await resetRestockOrder();
    await resetProductRko();
    await resetSkuItemRko();
    await resetTestDescriptor()
    await resetTestResult();
    await resetReturnOrder();
    await resetProductRto();
    await resetInternalOrder();
    await resetProductSkuIO();
    await resetProductRfidIO();
    await resetItem();
    await resetUser();
}

//popolate db
async function fillTable() {

    await insertSKU('test1',100,100,'test1',1,100);
    await insertSKU('test2',100,100,'test2',1,100);

    await insertSkuItem("123", 1, '2022/04/04');
    await insertSkuItem("456", 2, '2022/04/04');
    await insertSkuItem("789", 2, '2022/04/04');
    await insertSkuItem("999", 1 ,'2022/04/04');

    await insertRestockOrder('2022/04/04', 'ISSUED', 5);
    await insertProductRko(1, 1, "descrizione1", 1, 1);
    await insertSkuItemRko(1, 1, 1);

    await insertRestockOrder('2022/04/04', 'COMPLETEDRETURN', 5);
    await insertProductRko(2, 1, "descrizione2", 1, 1);
    await insertSkuItemRko(2, 1, 2);
    await insertSkuItemRko(2, 2, 3);

    await insertTestDescriptor('td1','test1',1);
    await insertTestResult(1,1,'2022/04/04','Fail');
    await insertTestResult(2,1,'2022/04/04','Pass');

    await insertTestDescriptor('td2','test2',1);
    await insertTestResult(2,2,'2022/04/04','Fail');
    await insertTestResult(3,2,'2022/04/04','Pass');

    await insertReturnOrder('2022/04/04',1);
    await insertProductRto(1,1,'desc1',1,1);

    await insertReturnOrder('2022/04/04',2);
    await insertProductRto(2,2,'desc2',1,3);

    await insertInternalOrder('2022/04/04','ISSUED',1);
    await insertProductSkuIO(1,1,'d1',1,1);
    await insertProductRfidIO(1,1,4);

    await insertInternalOrder('2022/04/04','COMPLETED',1);
    await insertProductSkuIO(2,2,'d2',1,1);
    await insertProductRfidIO(2,2,2);

    await insertItem(1,'dI1',1,1,5);
    await insertItem(2,'dI2',1,2,5);
    await insertItem(3,'dI3',1,2,5);

    await insertUser('testName','surname1','mail1','customer','psw1','salt1');
    await insertUser('testName','surname2','mail2','qualityemployee','psw2','salt2');
    await insertUser('testName','surname3','mail3','clerk','psw3','salt3');
    await insertUser('testName','surname4','mail4','deliveryEmployee','psw4','salt4');
    await insertUser('testName','surname5','mail5','supplier','psw5','salt5');
    await insertUser('testName','surname6','mail6','manager','psw6','salt6');
    
}


/*******************************
 *                             *
 *           INSERT            *
 *                             *
 *******************************/


function insertSKU(description, weight, volume, notes, price, availableQuantity) {
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO SKUS (description, weight, volume, notes, price, availableQuantity) VALUES(?,?,?,?,?,?)';
        db.run(sqlInsert, [description, weight, volume, notes, price, availableQuantity], (err) => {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertSkuItem(rfid, skuId, dateOfStock) {
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO "SKU-ITEMS" (RFID, SKUId, Available, DateOfStock) VALUES(?,?,0,?)';
        db.run(sqlInsert, [rfid, skuId, dateOfStock], (err) => {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertRestockOrder(newDate, newState, supplierId, transportNote = '') {
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO "restock-orders" (issueDate, state, supplierId, transportNote) VALUES(?,?,?,?)';
        db.run(sqlInsert, [newDate, newState, supplierId, transportNote], function (err) {
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

function insertProductRko(orderId, SKUId, description, price, qty) {
    return new Promise((resolve, reject) => {
        const insert = 'INSERT INTO "products-rko" (orderId, skuId, description, price, quantity) VALUES (?,?,?,?,?)';
        db.run(insert, [orderId, SKUId, description, price, qty], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertSkuItemRko(orderId, SKUId, SKUItemId) {
    return new Promise((resolve, reject) => {
        const addItem = 'INSERT INTO "sku-items-rko" (orderId, skuItemId, skuId) VALUES (?,?,?)';
        db.run(addItem, [orderId, SKUItemId, SKUId], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertTestDescriptor(testName, procedureDescription, SKUid){
    return new Promise((resolve,reject) => {
        const sqlInsert = 'INSERT INTO "TEST-DESCRIPTORS"(name, procedureDescription, idSKU) VALUES(?,?,?)';
        db.all(sqlInsert, [testName, procedureDescription, SKUid], (err) => {
            if(err) {
                reject(err);
                return;
            }
            else resolve('Done');
        });
    });
}

function insertTestResult(skuItemId, descriptorId, date, result){
    return new Promise((resolve,reject) => {
        const sqlInsert = 'INSERT INTO "TEST-RESULTS"(SKUitemId, descriptorId, date, result) VALUES(?,?,?,?)';
        db.all(sqlInsert, [skuItemId, descriptorId, date, result], (err) => {
            if(err) {
                reject(err);
                return;
            }
            else resolve('Done');
        });
    });
}

function insertReturnOrder(returnDate, restockOrderId){
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO "return-orders" (returnDate, restockOrderId) VALUES(?,?)';
        db.run(sqlInsert, [returnDate, restockOrderId], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve(this.lastID);
        });
    });
}

function insertProductRto(orderId, SKUId, description, price, skuItemId) {
    return new Promise((resolve, reject) => {
        const insert = 'INSERT INTO "products-rto" (orderId, skuId, description, price, skuItemId) VALUES (?,?,?,?,?)';
        db.run(insert, [orderId, SKUId, description, price, skuItemId], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertInternalOrder(issueDate, state, customerId){
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO "internal-orders" (issueDate, state, customerId) VALUES(?,?,?)';
        db.run(sqlInsert, [issueDate, state, customerId], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve(this.lastID);
        });
    });
}

function insertProductSkuIO(orderId, SKUId, description, price, qty){
    return new Promise((resolve, reject) => {
        const insert = 'INSERT INTO "products-sku-io" (orderId, skuId, description, price, qty) VALUES (?,?,?,?,?)';
        db.run(insert, [orderId, SKUId, description, price, qty], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertProductRfidIO(orderId, SkuID, skuItemId){
    return new Promise((resolve, reject) => {
        const addRfid = 'INSERT INTO "products-rfid-io" (orderId, skuId, skuItemId) VALUES (?,?,?)';
        db.run(addRfid, [orderId, SkuID, skuItemId], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertItem(id, description, price, SKUId, supplierId){
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO ITEMS (id, description, price, SKUId, supplierId) VALUES(?,?,?,?,?);';
        db.run(sqlInsert, [id, description, price, SKUId, supplierId], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve('Done');
        });
    });
}

function insertUser(name, surname, username, type, password, salt){
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO USERS (name, surname, email, type, password, salt) VALUES(?,?,?,?,?,?)';
        db.run(sqlInsert, [name, surname, username, type, password, salt], (err) => {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}


/*******************************
 *                             *
 *           CLEAN             *
 *                             *
 *******************************/


function cleanRestockOrder() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "restock-orders"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanProductRko() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "products-rko"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanSkuItemRko() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "sku-items-rko"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanSku() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "skus"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanSkuItem() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "sku-items"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanTestDescriptor() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "test-descriptors"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanTestResult() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "test-results"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanReturnOrder() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "return-orders"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanProductRto() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "products-rto"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanInternalOrder() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "internal-orders"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanProductSkuIO() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "products-sku-io"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanProductRfidIO() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "products-rfid-io"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanItem(){
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM "items"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanUser(){
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM USERS WHERE name=testName';
        db.run(sqlDelete, [username, type], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve(this.changes);
        });
    });
}


/*******************************
 *                             *
 *           RESET             *
 *                             *
 *******************************/


function resetRestockOrder() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="restock-orders"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetProductRko() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="products-rko"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function resetSkuItemRko() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="sku-items-rko"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function resetSku() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="skus"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function resetSkuItem() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="sku-items"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function resetTestDescriptor() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="test-descriptors"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetTestResult() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="test-results"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetReturnOrder() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="return-orders"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetProductRto() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="products-rto"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetInternalOrder() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="internal-orders"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetProductSkuIO() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="products-sku-io"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetProductRfidIO() {
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="products-rfid-io"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetItem(){
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="items"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
function resetUser(){
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="users"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}
