'use strict';
const Positon = require('../model/position.js');

const sqlite = require('sqlite3');
const { getPositionCoordinates } = require('../model/position.js');

class PositionDBU {

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

    loadPosition(positionId=undefined) {

        const sqlId = 'SELECT * FROM positions WHERE positionId=?';
        const sqlAll = 'SELECT * FROM ';

        let sqlInfo = {sql: undefined, values: undefined};

        if(!positionId) {
            // get all positions
            sqlInfo.sql = sqlAll;
            sqlInfo.values = [];
        } else {
            // get position by id
            sqlInfo.sql = sqlId;
            sqlInfo.values = [positionId];
        }

        return new Promise((resolve, reject) => {
            this.db.all(sqlInfo.sql, sqlInfo.values, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const positions = rows.map(p => {
                    const pos = new Positon(p.positionId, p.aisleId, p.row, p.col, p.maxWeight, p.maxVolume, p.occupiedWeight, p.occupiedVolume);
                    return pos;
                });
                resolve(positions);
            });
        });
    }

    // return -> void
    insertPosition(positionId, aisleId, row, col, maxWeight, maxVolume) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO positions (positionID, aisleID, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) VALUES(?,?,?,?,?,?,0,0)';
            this.db.run(sqlInsert, [positionId, aisleId, row, col, maxWeight, maxVolume], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        });
    }

    ///////////////////////////////////////// TODO ///////////////////////////////////////////////

    // VERSION 1 - only positionId is modified
    // this function returns the number of rows which have been modified
    updatePosition(oldPositionId, newPositionId) {
        const coordinates = getPositionCoordinates(newPositionId);
        return new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE positions SET positionId=?, aisleID=?, row=?, col=? WHERE positionId=?';
            this.db.run(sqlUpdate, [newPositionId, coordinates[0], coordinates[1], coordinates[2], oldPositionId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    deleteSKU(id) {
        // delete other things to keep consistency - TODO
        return new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM SKUS WHERE id=?';
            this.db.run(sqlDelete, [id], function (err) {
                if (err) {
                    reject(err);
                    console.log(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    // private method to get test descriptors for a given skuId 
   #getTestDescriptors(id) {
        return new Promise((resolve, reject) => {
            const test = 'SELECT id FROM "TEST-DESCRIPTORS" WHERE idSKU=?';
            this.db.all(test, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const tests = rows.map((t) => t.id);
            resolve(tests);;
            });
        });
   }

    
}

module.exports = PositionDBU;