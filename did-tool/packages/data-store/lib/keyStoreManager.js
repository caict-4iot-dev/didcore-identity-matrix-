import kdb from './keyDatabase.js';
import {keystore} from './keystore.js'

export class keyStoreManager {

    static async validateAuthenticationContext(keyDocumentInstance) {

        const fields = ['id', 'controller', 'publicKeyMultibase'];
        for (const field of fields) {
            if (!keyDocumentInstance[field] || keyDocumentInstance[field].length === 0) {
                return false;
            }
        }
        return true;
    }


    static async formatKeyStore(jsonData, password) {

        const jsonString = JSON.stringify(jsonData);
        const keyStore = await keystore.create(jsonString, password);
        const keyStoreString = JSON.stringify(keyStore);
        return keyStoreString;
    }

    static async runAsync(query, ...params) {
        return new Promise((resolve, reject) => {
            kdb.run(query, ...params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    static async validateStorageType(storageType) {
        if(!storageType || storageType !== "sqlite"){
            throw {
                errorCode: 300001,
                message: 'Unsupported storage type error',
            };
        }
    }
    //保存
    static async importKey({jsonData, password, storageType} = {}) {

        await this.validateStorageType(storageType);
        try {
            if (!password || password.length === 0) {
                return {
                    errorCode: 200004,
                    message: 'Password does not exist',
                };
            }
            // 格式校验
            if(!await this.validateAuthenticationContext(jsonData)){
                return {
                    errorCode: 100002,
                    message: 'Document format error',
                };
            }

            // 将 JSON 转换为字符串
            const keyStoreString = await this.formatKeyStore(jsonData, password);

            // 将 JSON 数据插入数据库
            const insertQuery  = `INSERT INTO key_documents VALUES ( ?, ? )`;

            // 执行插入操作
            await this.runAsync(
                insertQuery,
                jsonData.id, keyStoreString
            );
            return {
                errorCode: 0,
                message: 'SUCCESS',
            };
        } catch (error) {
            console.log('Error connecting to the database:', error);
            // 根据错误类型设置不同的错误码和消息
            let errorCode, errorMessage;
            if (error.errno === 19) {
                errorCode = 200001; // 文档的BID重复
                errorMessage = 'Duplicate key ID for the document';
            } else {
                errorCode = 400000; // 系统错误
                errorMessage = 'System error';
            }
            return {
                errorCode: errorCode,
                message: errorMessage,
            };

        }
    }
    //修改
    static async updateKey({jsonData, password, storageType} = {}) {
        await this.validateStorageType(storageType);
        try {
            if (!password || password.length === 0) {
                return {
                    errorCode: 200004,
                    message: 'Password does not exist',
                };
            }
            // 格式校验
            if(!await this.validateAuthenticationContext(jsonData)){
                return {
                    errorCode: 100002,
                    message: 'Document format error',
                };
            }

            // 将 JSON 转换为字符串
            const keyStoreString = await this.formatKeyStore(jsonData, password);

            // 构建 UPDATE 查询
            const updateQuery = `UPDATE key_documents SET keyStore = ? WHERE id = ?`;

            // 执行插入操作
            const result = await this.runAsync(
                updateQuery,
                keyStoreString, jsonData.id
            );

            if(result && result.changes > 0){
                return {
                    errorCode: 0,
                    message: 'SUCCESS',
                };

            }else{
                return {
                    errorCode: 200003,
                    message: 'Key ID for the document does not exist',
                };
            }
        } catch (error) {
            console.log('Error connecting to the database:', error);

            return {
                errorCode: 400000,
                message: 'System error',
            };

        }
    }

    // 根据 Key 查询数据并返回
    static async getKey({kid, password, storageType} = {}) {
        await this.validateStorageType(storageType);
        try {
            if (!password || password.length === 0) {
                return {
                    errorCode: 200004,
                    message: 'Password does not exist',
                };
            }
            // 根据 Key 查询文档
            const query  = `SELECT * FROM key_documents WHERE id = ?`;

            // 执行查询操作
            const result = await new Promise((resolve, reject) => {
                kdb.get(query, kid, (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (result) {
                let  keyStore = result.keyStore;
                if (typeof keyStore === 'string') {
                    keyStore = JSON.parse(keyStore)
                }
                const keyDocumentInstance = await keystore.imported(keyStore, password);
                if(!keyDocumentInstance) {
                    return {
                        errorCode: 200005,
                        message: 'Password error'
                    };
                }
                const parsedObject = JSON.parse(keyDocumentInstance);

                return {
                    errorCode: 0,
                    message: 'SUCCESS',
                    data: {
                        keyDocument: parsedObject
                    }
                };
            }else{
                return {
                    errorCode: 200003,
                    message: 'Key ID for the document does not exist'
                };
            }

        } catch (error) {
            console.log('Error connecting to the database:', error);
            return {
                errorCode: 400000,
                message: 'System error'
            };

        }
    }


    // 根据 Key 删除数据
    static async deleteKey({kid, storageType} = {}) {
        await this.validateStorageType(storageType);
        try {
            // 构建 sql
            const deleteQuery = 'DELETE FROM key_documents WHERE id = ?';

            // 执行插入操作
            const result = await this.runAsync(
                deleteQuery,
                kid
            );
            console.log("result:", result);
            return {
                errorCode: 0,
                message: 'SUCCESS',
            };
        } catch (error) {
            console.log('Error connecting to the database:', error);
            return {
                errorCode: 400000,
                message: 'System error'
            };
        }
    }


    // 根据 Key 查询数据并返回
    static async listKeys({pageStart, pageSize, storageType} = {}) {
        await this.validateStorageType(storageType);
        try {
            pageStart = pageStart?pageStart:1;
            pageSize = pageSize?pageSize:1000;
            // 构建 SELECT 查询
            const selectQuery = 'SELECT id FROM key_documents LIMIT ? OFFSET ?';
            // 构建 COUNT 查询
            const countQuery = 'SELECT COUNT(*) AS totalCount FROM key_documents';


            // 计算 OFFSET 值
            const offset = (pageStart - 1) * pageSize;

            // 执行 SELECT 操作
            const rows = await new Promise((resolve, reject) => {
                kdb.all(selectQuery, [pageSize, offset], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            // 执行 COUNT 操作
            const countResult = await new Promise((resolve, reject) => {
                kdb.get(countQuery, [], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            const idList = rows.map(row => row.id);

            return {
                errorCode: 0,
                message: 'SUCCESS',
                page: {
                    pageStart: pageStart,
                    pageSize: pageSize,
                    pageTotal: countResult.totalCount
                },
                dataList: idList
            };
        } catch (error) {
            console.log('Error connecting to the database:', error);
            return {
                errorCode: 400000,
                message: 'System error'
            };
        }
    }

}
