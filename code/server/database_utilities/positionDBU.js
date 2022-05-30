'use strict';
const Positon = require('../model/position.js');

const sqlite = require('sqlite3');
const { getPositionCoordinates, getPositionId } = require('../model/position.js');

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
    close() {
        this.db.close();
    }

    loadPosition(positionId=undefined) {

        const sqlId = 'SELECT * FROM positions WHERE positionId=?';
        const sqlAll = 'SELECT * FROM positions';

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
                    const pos = new Positon(p.positionId, p.aisleId, p.row, p.col, p.maxWeight, p.maxVolume, 
                        p.occupiedWeight, p.occupiedVolume);
                    return pos;
                });
                resolve(positions);
            });
        });
    }


    insertPosition(positionId, aisleId, row, col, maxWeight, maxVolume) {
        return new Promise((resolve, reject) => {
            const sqlInsert = 'INSERT INTO positions (positionId, aisleId, row, col, maxWeight, maxVolume, \
                occupiedWeight, occupiedVolume) VALUES(?,?,?,?,?,?,0,0)';
            this.db.run(sqlInsert, [positionId, aisleId, row, col, maxWeight, maxVolume], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else resolve('Done');
            });
        });
    }

    // this function returns the number of rows which have been modified
    updatePosition(oldPositionId, newPosition, newPositionId=undefined, newAisleId=undefined, newRow=undefined, newCol=undefined, newMaxWeight=undefined, newMaxVolume=undefined, newOccupiedWeight=undefined, newOccupiedVolume=undefined) {
        
        const sqlId = 'UPDATE positions SET positionId=?, aisleId=?, row=?, col=? WHERE positionID=?';
        const sqlObj = 'UPDATE positions SET positionId=?, aisleId=?, row=?, col=?, maxWeight=?, maxVolume=?, \
            occupiedWeight=?, occupiedVolume=? WHERE positionId=?';

        let sqlInfo = {sql: undefined, values: undefined};

        if(!newPositionId && !newPosition) {
            // update all fields
            sqlInfo.sql = sqlObj;
            sqlInfo.values = [getPositionId(newAisleId, newRow, newCol), newAisleId, newRow, newCol, newMaxWeight, 
                newMaxVolume, newOccupiedWeight, newOccupiedVolume, oldPositionId];
        } else if (newPosition) {
            // update all fields, taking them from the Position object
            sqlInfo.sql = sqlObj;
            sqlInfo.values = [newPosition.positionID, newPosition.aisleID, newPosition.row, newPosition.col, 
                newPosition.maxWeight, newPosition.maxVolume, newPosition.occupiedWeight, newPosition.occupiedVolume, oldPositionId];
        } else {
            // update only positionId
            const coordinates = getPositionCoordinates(newPositionId);
            sqlInfo.sql = sqlId;
            sqlInfo.values =  [newPositionId, coordinates[0], coordinates[1], coordinates[2], oldPositionId];
        }
       
        return new Promise((resolve, reject) => {
            this.db.run(sqlInfo.sql, sqlInfo.values, function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    async deletePosition(positionId) {
        // get the position id
        const id = await this.#getPositionIncrementalId(positionId);
        if (!id) {
            // the position does not exist
            return 0;   // no changes
        }
        // check dependency
        const dependency = await this.#checkDependency(id);
        if (dependency) {
            throw(new Error("Dependency detected. Delete aborted.", 14));
        }
        return new Promise((resolve, reject) => {
            const sqlDelete = 'DELETE FROM positions WHERE positionId=?';
            this.db.run(sqlDelete, [positionId], function (err) {
                if (err) {
                    reject(err);
                    return;
                } else resolve(this.changes);
            });
        });
    }

    #getPositionIncrementalId(positionId) {
        const sql = 'SELECT id FROM positions WHERE positionId=?'
        return new Promise((resolve, reject) => {
            this.db.get(sql, [positionId], (err, row) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(row ? row.id : undefined);
            })
        });
   }

    #checkDependency(id) {
        // positions can be referenced by skus
        return new Promise((resolve, reject) => {
            const position = 'SELECT position FROM skus WHERE position=?';
            this.db.all(position, [id], (err, rows) => {
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

module.exports = PositionDBU;