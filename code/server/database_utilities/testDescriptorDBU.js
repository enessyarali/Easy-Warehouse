'use strict';
const TESTDESCRIPTOR = require('../model/testDescriptor.js');
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

            this.db.all(sqlInfo.sql, sqlInfo.values, (err,rowl) => {
                if(err) {
                    reject(err);
                    return;
                }
                else {
                    const descriptors = rows.map((td) => {
                        const descriptor = new TESTDESCRIPTOR(td.id,td.name,td.procedureDescription, td.SKUid);
                        return descriptor;
                    });
                    resolve(descriptors);
                }
            });
        });
    }

    insertTestDescriptor(testDescriptor) {
        return new Promise((resolve,reject) => {
            const sqlCreate = 'CREATE TABLE IF NOT EXISTS "TEST-DESCRIPTORS" ( id INTEGER NOT NULL, name TEXT NOT NULL, procedureDescription TEXT NOT NULL, SKUId INTEGER NOT NULL, PRIMARY KEY(id AUTOINCREMENT))';
            this.db.all(sqlCreate, [], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve('Done');
            });
            const sqlInsert = 'INSERT INTO "TEST-DESCRIPTORS"(name,procedureDescription,SKUid) VALUES(?,?,?)';
            this.db.all(sqlInsert, [testDescriptor.name, testDescriptor.procedureDescription,testDescriptor.SKUid], (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                else resolve('Done');
            });
        });
    }

    updateTestDescriptor(testDescriptor) {
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE "TEST-DESCRIPTORS" SET name = ?, procedureDescription = ?, SKUid = ?';
            this.db.all(sqlUpdate, [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.SKUid], function (err) {
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

    deleteTestDescriptor(testId=undefined,SKUid=undefined) {
        let sqlInfo = {sql: undefined, values: undefined};

        if(testId) {
            const sqlDeleteFromId = 'DELETE FROM "TEST-DESCRIPTORS" WHERE id = ?';
            sqlInfo.sql = sqlDeleteFromId;
            sqlInfo.values = [testId];
        }
        else if(SKUid) {
            const sqlDeleteFromSKUid = 'DELETE FROM "TEST-DESCRIPTORS" WHERE SKUid = ?';
            sqlInfo.sql = sqlDeleteFromSKUid;
            sqlInfo.values = [SKUId];
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
module.exports = TestDescriptorDBU;

/*
id 
name 
procedureDescription 
SKUid 
*/