'use strict';
const TestResult = require('../model/testResult.js');
const Error = require('../model/error.js');

const sqlite = require('sqlite3');

class TestResultDBU {

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

// get testResult(s) from the TEST-RESULTS table and return it/them as a TestResult object
    async loadTestResult(rfId, resultId = undefined) {
        const isSKUitem = await this.#checkSKUitem(rfId);
        if(!isSKUitem){
            throw( new Error("SKUitem does not exist", 9));
        }
        return new Promise((resolve, reject) => {
            const sqlInfo = {sql: undefined, values: undefined};
                if(resultId) {
                    const sqlResultId = 'SELECT * FROM "TEST-RESULTS" WHERE id = ? AND SKUitemId = ?';
                    sqlInfo.sql = sqlResultId;
                    sqlInfo.values = [resultId, isSKUitem];
                }
                else {
                    const sqlNoResultId = 'SELECT * FROM "TEST-RESULTS" WHERE SKUitemId = ?';
                    sqlInfo.sql = sqlNoResultId;
                    sqlInfo.values = [isSKUitem];
                }
    
                this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    else {
                        const results = rows.map((tr) => {
                            const res = new TestResult(tr.SKUitemRFid, tr.id, tr.descriptorId, tr.date, tr.result =='Pass'? true : false);
                            return res;
                        });
                        resolve(results);
                    }
                });
        });
    }

// insert a new TestResult inside the TEST-RESULTS table
    async insertTestResult(SKUitemRFid, descriptorId, date, result) {
        // check if SKUitem exists
        const isSKUitem = await this.#checkSKUitem(SKUitemRFid);
        if (!isSKUitem)
            throw(new Error("SKUitem does not exist. Operation aborted.", 9));
        // check if TestDescriptor exists
        const isDescriptorId = await this.#checkDescriptorId(descriptorId);
        if(!isDescriptorId)
            throw(new Error("TestDescriptor does not exist. Operation aborted",11));

        return new Promise((resolve,reject) => {
            const sqlInsert = 'INSERT INTO "TEST-RESULTS"(SKUitemId, descriptorId, date, result) VALUES(?,?,?,?)';
            this.db.all(sqlInsert, [isSKUitem, descriptorId, date, result ? 'Pass' : 'Fail'], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                else resolve('Done');
            });
        });
    }

// update a selected TestResult in the TEST-RESULTS table. Return number of rows modified
    updateTestResult(id, descriptorId, date, result) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "TEST-RESULTS" SET descriptorId = ?, date = ?, result = ? WHERE id = ?';
            this.db.run(sqlUpdate, [descriptorId, date, result ? 'Pass' : 'Fail', id], function (err) {
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

// delete one or more TestResult from the TEST-RESULTS table given different input. Return number of rows modified
    async deleteTestResult(skuItemRFid, resultId) {
        let sqlInfo = {sql: undefined, values: undefined};

        if(resultId && skuItemRFid) {
            const skuItemId = await this.#checkSKUitem(skuItemRFid)
            if(skuItemId){
                const sqlDeleteFromResultId = 'DELETE FROM "TEST-RESULTS" WHERE id = ? AND SKUitemId = ?';
                sqlInfo.sql = sqlDeleteFromResultId;
                sqlInfo.values = [resultId, skuItemId];
            }
            else {
                throw( new Error("SKUitem does not exist", 9));
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
// private method to check whether skuItemId corresponds to an existing skuItem
    #checkSKUitem(skuItemRFid) {
        const sql = 'SELECT id FROM "SKU-ITEMS" WHERE RFID=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [skuItemRFid], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.id : false);
            })
        });
    }

// private method to check whether descriptorId corresponds to an existing TestDescriptor
    #checkDescriptorId(descriptorId) {
        const sql = 'SELECT id FROM "TEST-DESCRIPTORS" WHERE id=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [descriptorId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? true : false);
            })
        });
    }

}

module.exports = TestResultDBU;

/* 
SKUitemRFid
id
descriptorId
date
result
*/