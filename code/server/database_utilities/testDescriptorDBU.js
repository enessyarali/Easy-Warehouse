'use strict';
const TestDescriptor = require('../model/testDescriptor.js');
const Error = require('../model/error.js');

const sqlite = require('sqlite3');

class TestDescriptorDBU {

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

// get testDescriptor(s) from the TEST-DESCRIPTORS table and return it/them as a TestDescriptor object
    loadTestDescriptor(id=undefined) {
        return new Promise((resolve, reject) => {
            const sqlInfo = {sql: undefined, values: undefined};

            if(id) {
                const sqlId = 'SELECT * FROM "TEST-DESCRIPTORS" WHERE id = ?';
                sqlInfo.sql = sqlId;
                sqlInfo.values = [id];
            }
            else{
                const sqlNoId = 'SELECT * FROM "TEST-DESCRIPTORS"';
                sqlInfo.sql = sqlNoId;
                sqlInfo.values = [];
            }

            this.db.all(sqlInfo.sql, sqlInfo.values, (err,rows) => {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    const descriptors = rows.map((td) => {
                        const descriptor = new TestDescriptor(td.id, td.name, td.procedureDescription, td.idSKU);
                        return descriptor;
                    });
                    resolve(descriptors);
                }
            });
        });
    }

// insert a new TestDescriptor inside the TEST-DESCRIPTORS table
    async insertTestDescriptor(name, procedureDescription, SKUid) {
         // check if SKUId exist
         const isSKU = await this.#checkSKU(SKUid);
         if (!isSKU)
             throw(new Error("SKU does not exist. Operation aborted.", 3));
        return new Promise((resolve,reject) => {
            const sqlInsert = 'INSERT INTO "TEST-DESCRIPTORS"(name, procedureDescription, idSKU) VALUES(?,?,?)';
            this.db.all(sqlInsert, [name, procedureDescription, SKUid], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                else resolve('Done');
            });
        });
    }

// update a selected TestDescriptor in the TEST-DESCRIPTORS table. Return number of rows modified
   async updateTestDescriptor(id, newName, newProcedure, newIdSKU) {
        // check if SKUId exist
        const isSKU = await this.#checkSKU(newIdSKU);
        if (!isSKU)
            throw(new Error("SKU does not exist. Operation aborted.", 3));

        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "TEST-DESCRIPTORS" SET name = ?, procedureDescription = ?, idSKU = ? WHERE id = ?';
            this.db.run(sqlUpdate, [newName, newProcedure, newIdSKU, id], function (err) {
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

// delete one or more TestDescriptor from the TEST-DESCRIPTORS table given different input. Return number of rows modified
    async deleteTestDescriptor(testId=undefined) { 
        const dependency = await this.#checkDependency(testId);
        if (dependency) {
            // if there is at least 1 dependency
            throw (new Error("Dependency detected. Delete aborted.", 14));
        }
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM "TEST-DESCRIPTORS" WHERE id = ?';
            this.db.run(sql, [testId], function (err) {
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

    // private method to check whether skuId corresponds to an existing SKU
    #checkSKU(skuId) {
        const sql = 'SELECT id FROM "SKUS" WHERE id=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.id : false);
            })
        });
    }

    #checkDependency(id) {
        // test-results check
        return new Promise((resolve, reject) => {
            const testDescriptor = 'SELECT id FROM "test-results" WHERE descriptorId=?';
            this.db.all(testDescriptor, [id], (err, rows) => {
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
module.exports = TestDescriptorDBU;

/*
id 
name 
procedureDescription 
SKUid 
*/