/* istanbul ignore file */

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

exports.resetAutoInc = async () => {
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
    await resetPosition();
}

exports.setupHardCodedUsers = async () => {
    await cleanUser();
    await resetUser();
    /* HARD CODED USERS */
    await insertUser("John","Travolta","user1@ezwh.com","customer", "4Ehqbsh2XjnZg3pkKiYqjOM6Nam2OFfmb1C/IhPmalJ2q6IcoREbXIOdJhuI9f+RDa7ssd0B7hy652uE4/6LHA==","f1d75ca8a25b907e3970f32441d955cd5dce951ad45da6ae20");
    await insertUser("Paul","Messy","qualityEmployee1@ezwh.com","qualityEmployee","4Ehqbsh2XjnZg3pkKiYqjOM6Nam2OFfmb1C/IhPmalJ2q6IcoREbXIOdJhuI9f+RDa7ssd0B7hy652uE4/6LHA==","f1d75ca8a25b907e3970f32441d955cd5dce951ad45da6ae20");
    await insertUser("Hugo","Reyes","clerk1@ezwh.com","clerk","GXLk4tKsDYs+3S64luKAXk/IVjek15f8LwL3pa695+8xMCSQ4xsfRNjY0z2WemkvRY1aujFDeq2RnWI7VufwpQ==","f969075f1939118f3121dac611c3d3ea2dcee600bff747688d");
    await insertUser("Sayid","Jarrah","deliveryEmployee1@ezwh.com","deliveryEmployee","tZvIde5C0zHfNozUTgOLL3HG3/w2fdI9kLw8GQ/mTc68biCgiLjsx6tdzCH07QUxztTVa/viTqau13Z0AJz6Mg==","b89ceaf137eeb67699852a1cd92802292a0639b9770e0ca9d8");
    await insertUser("Ben","Linus","supplier1@ezwh.com","supplier","SEL5Qj2mK6MfoNfaSjNWON7Vgd4FxYVPhmPDmmt/CUz/+zIDxK6/ZxLggWyM1r7xX0jF2YyY++gPEXza+UYaDg==","f1878c01fe90cb45aa54b7d26e10a7a4cadcd6a92b8d3b4170");
    await insertUser("Andy","Cheaper","manager1@ezwh.com","manager","oduc+F0kCin6RqAvc34itVMdRFvy3GlnEMZ2CtD2kIiZbR8DLdE4cZX1OxORTuTzidVfwWDm0A7PtJQ++PFKwg==","dfdc8ea7e2d41c58dfc23505be7697511cd4a4d560fe6262ad");
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
exports.voidSkuItem = async () => {
    await cleanSkuItem();

    await resetSkuItem();
}
exports.createSkuItemDependency = async () => {
    await insertSKU('test3',300,300,'test3',3,300,null);
    await insertSkuItem('666', 3, 0,'2022/04/04');

    await insertSkuItemRko(2, 3, 5);
    await insertTestResult(5, 1, '2022/04/04','Fail');
    await insertProductRfidIO(3,3,5);
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
    await cleanPosition();

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
    await resetPosition();
}

//popolate db
async function fillTable() {

    await insertSKU('test1',1,1,'test1',1,100,1);
    await insertSKU('test2',100,100,'test2',1,100,null);

    await insertSkuItem("123", 1, 0,'2022/04/04');
    await insertSkuItem("456", 2, 1,'2022/04/04');
    await insertSkuItem("789", 2, 1,'2022/04/04');
    await insertSkuItem("999", 1, 0,'2022/04/04');

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
    //await insertItem(3,'dI3',1,2,5);      the insertion of this item causes problems

    /* HARD CODED USERS */
    await insertUser("John","Travolta","user1@ezwh.com","customer", "4Ehqbsh2XjnZg3pkKiYqjOM6Nam2OFfmb1C/IhPmalJ2q6IcoREbXIOdJhuI9f+RDa7ssd0B7hy652uE4/6LHA==","f1d75ca8a25b907e3970f32441d955cd5dce951ad45da6ae20");
    await insertUser("Paul","Messy","qualityEmployee1@ezwh.com","qualityEmployee","4Ehqbsh2XjnZg3pkKiYqjOM6Nam2OFfmb1C/IhPmalJ2q6IcoREbXIOdJhuI9f+RDa7ssd0B7hy652uE4/6LHA==","f1d75ca8a25b907e3970f32441d955cd5dce951ad45da6ae20");
    await insertUser("Hugo","Reyes","clerk1@ezwh.com","clerk","GXLk4tKsDYs+3S64luKAXk/IVjek15f8LwL3pa695+8xMCSQ4xsfRNjY0z2WemkvRY1aujFDeq2RnWI7VufwpQ==","f969075f1939118f3121dac611c3d3ea2dcee600bff747688d");
    await insertUser("Sayid","Jarrah","deliveryEmployee1@ezwh.com","deliveryEmployee","tZvIde5C0zHfNozUTgOLL3HG3/w2fdI9kLw8GQ/mTc68biCgiLjsx6tdzCH07QUxztTVa/viTqau13Z0AJz6Mg==","b89ceaf137eeb67699852a1cd92802292a0639b9770e0ca9d8");
    await insertUser("Ben","Linus","supplier1@ezwh.com","supplier","SEL5Qj2mK6MfoNfaSjNWON7Vgd4FxYVPhmPDmmt/CUz/+zIDxK6/ZxLggWyM1r7xX0jF2YyY++gPEXza+UYaDg==","f1878c01fe90cb45aa54b7d26e10a7a4cadcd6a92b8d3b4170");
    await insertUser("Andy","Cheaper","manager1@ezwh.com","manager","oduc+F0kCin6RqAvc34itVMdRFvy3GlnEMZ2CtD2kIiZbR8DLdE4cZX1OxORTuTzidVfwWDm0A7PtJQ++PFKwg==","dfdc8ea7e2d41c58dfc23505be7697511cd4a4d560fe6262ad");
    await insertUser('testName','surname1','mail1','customer','psw1','salt1');

    await insertPosition('111','1','1','1',500,500,100,100);
    await insertPosition('222','2','1','1',50,50,0,0);
    
}


/*******************************
 *                             *
 *           INSERT            *
 *                             *
 *******************************/


function insertSKU(description, weight, volume, notes, price, availableQuantity,position) {
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO SKUS (description, weight, volume, notes, price, availableQuantity, position) VALUES(?,?,?,?,?,?,?)';
        db.run(sqlInsert, [description, weight, volume, notes, price, availableQuantity, position], (err) => {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function insertSkuItem(rfid, skuId, available, dateOfStock) {
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO "SKU-ITEMS" (RFID, SKUId, Available, DateOfStock) VALUES(?,?,?,?)';
        db.run(sqlInsert, [rfid, skuId, available, dateOfStock], (err) => {
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

function insertPosition(positionId, aisleId, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume){
    return new Promise((resolve, reject) => {
        const sqlInsert = 'INSERT INTO positions (positionId, aisleId, row, col, maxWeight, maxVolume, \
            occupiedWeight, occupiedVolume) VALUES(?,?,?,?,?,?,?,?)';
        db.run(sqlInsert, [positionId, aisleId, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume], (err) => {
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
        const sqlDelete = 'DELETE FROM USERS';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}

function cleanPosition(){
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM positions';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
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
function resetPosition(){
    return new Promise((resolve, reject) => {
        const sqlDelete = 'DELETE FROM SQLITE_SEQUENCE WHERE name="positions"';
        db.run(sqlDelete, [], function (err) {
            if (err) {
                reject(err);
                return;
            } else resolve('Done');
        });
    });
}