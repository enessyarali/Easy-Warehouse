'use strict';
const TestDescriptor = require('../model/testDescriptor.js');
const Error = require('../model/error.js');
const TestResultDBU = require('./testResultDBU.js');

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
    updateTestDescriptor(id, newName, newProcedure, newIdSKU) {
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
    async deleteTestDescriptor(testId=undefined,SKUid=undefined) {
        let sqlInfo = {sql: undefined, values: undefined};

        if(testId) {
            const sqlDeleteFromId = 'DELETE FROM "TEST-DESCRIPTORS" WHERE id = ?';
            sqlInfo.sql = sqlDeleteFromId;
            sqlInfo.values = [testId];
            //propagate deletion of the TestDescription in the TEST-RESULTS table
            await this.db.deleteTestResult(testId);
        }
        else if(SKUid) {
            const sqlDeleteFromSKUid = 'DELETE FROM "TEST-DESCRIPTORS" WHERE idSKU = ?';
            sqlInfo.sql = sqlDeleteFromSKUid;
            sqlInfo.values = [SKUid];
            //get the Descriptor's Id given an SKUid
            const ids = await this.#getDecscriptorId(SKUid);
            for (let i of ids) {
                //propagate deletion of the TestDescription in the TEST-RESULTS table
                await this.db.deleteTestResult(i);
            }
        }
        else {
            throw( new Error("No Argument Passed", 10));
        }

        return new Promise((resolve, reject) => {
            this.db.run(sqlInfo.sql,sqlInfo.values, function (err) {
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
    //private method to get the Descriptor's Id given an SKUid
    #getDecscriptorId(SKUid){
        return new Promise((resolve, reject) => {
            this.db.run('SELECT * FROM "TEST-DESCRIPTORS" WHERE idSKU = ?', [SKUid], (err, rows) => {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    const ids = rows.map((td) => {
                        const id = td.id;
                        return id;
                    });
                    resolve(ids);
                }
            });
        }); 
    }

    // private method to check whether skuId corresponds to an existing sku
    #checkSKU(skuId) {
        const sql = 'SELECT id FROM skus WHERE id=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
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