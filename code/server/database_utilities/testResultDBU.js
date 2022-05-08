'use strict';
const TESTRESULT = require('../model/testResult.js');
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

    loadTestResult(rfId, resultId = undefined) {
        return new Promise((resolve, reject) => {
            const sqlInfo = {sql: undefined, values: undefined};

            if(resultId) {
                const sqlResultId = 'SELECT * FROM "TEST-RESULTS" WHERE id = ? AND SKUitemRFid = ?';
                sqlInfo.sql = sqlResultId;
                sqlInfo.values = [resultId, rfId];
            }
            else {
                const sqlNoResultId = 'SELECT * FROM "TEST-RESULTS" WHERE SKUitemRFid = ?';
                sqlInfo.sql = sqlNoResultId;
                sqlInfo.values = [rfId];
            }

            this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    const results = rows.map((tr) => {
                        const res = new TESTRESULT(tr.SKUitemRFid, tr.id, tr.descriptorId, tr.date, tr.result =='Pass'? true : false);
                        return res;
                    });
                    resolve(results);
                }
            });

        });
    }

    insertTestResult(testResult) {
        return new Promise((resolve,reject) => {
            const sqlCreate = 'CREATE TABLE IF NOT EXISTS "TEST-RESULTS" ( SKUitemRFid TEXT NOT NULL, id INTEGER NOT NULL, descriptorId INTEGER NOT NULL, date DATE NOT NULL, result VARCHAR(10) NOT NULL, PRIMARY KEY(id AUTOINCREMENT))';
            this.db.all(sqlCreate, [], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve('Done');
            });
            const sqlInsert = 'INSERT INTO "TEST-RESULTS"(SKUitemRFid, descriptorId, date, result) VALUES(?,?,?,?)';
            this.db.all(sqlInsert, [testResult.SKUitemRFid, testResult.descriptorId,testResult.date, testResult.result ? 'Pass' : 'Fail'], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                else resolve('Done');
            });
        });
    }

    updateTestResult(testResult) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "TEST-RESULTS" SET SKUitemRFid = ?, descriptorId = ?, date = ?, result = ? WHERE id = ?';
            this.db.all(sqlUpdate, [testResult.SKUitemRFid, testResult.descriptorId, testResult.date, testResult.result ? 'Pass' : 'Fail', testResult.id], function (err) {
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

    deleteTestResult(testId=undefined,SKUitemId=undefined, resultId = undefined) {
        let sqlInfo = {sql: undefined, values: undefined};

        if(resultId) {
            const sqlDeleteFromResultId = 'DELETE FROM "TEST-RESULTS" WHERE id = ?';
            sqlInfo.sql = sqlDeleteFromResultId;
            sqlInfo.values = [resultId];
        }
        else if(SKUitemId) {
            const sqlDeleteFromSKUitemId = 'DELETE FROM "TEST-RESULTS" WHERE SKUitemId = ?';
            sqlInfo.sql = sqlDeleteFromSKUitemId;
            sqlInfo.values = [SKUitemId];
        }
        else if(testId) {
            const sqlDeleteFromTestId = 'DELETE FROM "TEST-RESULTS" WHERE descriptorId = ?';
            sqlInfo.sql = sqlDeleteFromTestId;
            sqlInfo.values = [testId];
        }
        else {
            throw( new Error("No Argument Passed", 10));
        }
        
        return new Promise((resolve, reject) => {
            this.db.all(sqlInfo.sql,sqlInfo.values, function (err) {
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

}

module.exports = TestResultDBU;

/* 
SKUitemRFid
id
descriptorId
date
result
*/