import db from './didDatabase.js';
import DidDocument from './entities/DidDocument.js';

export class didStore {

  static async validateAuthenticationContext(didDocumentInstance) {

    const expectedContext = [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ];
  
    if (didDocumentInstance['@context'].length === 0) {
      return false;
    }
  
    for (const context of expectedContext) {
      if (!didDocumentInstance['@context'].includes(context)) {
        return false;
      }
    }
  
    const fields = ['id', 'authentication', 'extension', 'created', 'updated'];
    for (const field of fields) {
      if (!didDocumentInstance[field] || didDocumentInstance[field].length === 0) {
        return false;
      }
    }
    return true;
  }

  static async validateStorageType(storageType) {
    if(!storageType || storageType !== "sqlite"){
      throw {
        errorCode: 300001,
        message: 'Unsupported storage type error',
      };
    }
  }

  static async runAsync(query, ...params) {
    return new Promise((resolve, reject) => {
      db.run(query, ...params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }
  //保存
  static async importDID({jsonData, storageType} = {}) {
    await this.validateStorageType(storageType);
    try {
      const didDocumentInstance = new DidDocument(jsonData);
      // 格式校验
      if(!await this.validateAuthenticationContext(didDocumentInstance)){
        return {
          errorCode: 100002,
          message: 'Document format error',
        };
      }
      const entityData = didDocumentInstance.toEntity();
      // 保存文档
      const { id, context, verificationMethod, authentication, extension, service, created, updated, proof } = entityData;

      // 将 JSON 数据插入数据库
      const insertQuery  = `INSERT INTO did_documents VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`;

      // 执行插入操作
      await this.runAsync(
          insertQuery,
          id, context, verificationMethod, authentication, extension, service, created, updated, proof
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
        errorCode = 100001; // 文档的BID重复
        errorMessage = 'Duplicate BID for the document';
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
  static async updateDID({jsonData, storageType} = {}) {
    await this.validateStorageType(storageType);
    try {
      const didDocumentInstance = new DidDocument(jsonData);
      // 格式校验
      if(!await this.validateAuthenticationContext(didDocumentInstance)){
        return {
          errorCode: 100002,
          message: 'Document format error',
        };
      }
      const entityData = didDocumentInstance.toEntity();
      // 保存文档
      const { id, context, verificationMethod, authentication, extension, service, created, updated, proof } = entityData;

      // 构建 UPDATE 查询
      const updateQuery = `UPDATE did_documents SET
                                context = ?,
                                verificationMethod = ?,
                                authentication = ?,
                                extension = ?,
                                service = ?,
                                created = ?,
                                updated = ?,
                                proof = ?
                           WHERE id = ?`;

      // 执行插入操作
      const result = await this.runAsync(
          updateQuery,
          context, verificationMethod, authentication, extension, service, created, updated, proof, id
      );

      if(result && result.changes > 0){
        return {
          errorCode: 0,
          message: 'SUCCESS',
        };

      }else{
        return {
          errorCode: 100003,
          message: 'BID for the document does not exist',
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

  // 根据 did 查询数据并返回
  static async getDID({did, storageType} = {}) {
    await this.validateStorageType(storageType);
    try {
      // 根据 did 查询文档
      const query  = `SELECT * FROM did_documents WHERE id = ?`;

      // 执行查询操作
      const result = await new Promise((resolve, reject) => {
        db.get(query, did, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      if (result) {
        const didDocumentInstance = DidDocument.fromEntity(result);
        return {
          errorCode: 0,
          message: 'SUCCESS',
          data: {
            didDocument: didDocumentInstance
          }
        };
      }else{
        return {
          errorCode: 100003,
          message: 'BID for the document does not exist'
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


  // 根据 did 删除数据
  static async deleteDID({did, storageType} = {}) {
    await this.validateStorageType(storageType);
    try {
      // 构建 sql
      const deleteQuery = 'DELETE FROM did_documents WHERE id = ?';

      // 执行插入操作
      const result = await this.runAsync(
          deleteQuery,
          did
      );
      return {
        errorCode: 0,
        message: 'SUCCESS',
      };

    } catch (error) {
      console.log('Error connecting to the database:', error);

      // 根据错误类型设置不同的错误码和消息
      let errorCode, errorMessage;
      errorCode = 400000; // 系统错误
      errorMessage = 'System error';

      throw {
        errorCode,
        message: errorMessage,
      };

    }
  }


  // 根据 did 查询数据并返回
  static async listDIDs({pageStart, pageSize, storageType} = {}) {
    await this.validateStorageType(storageType);

    try {
      pageStart = pageStart?pageStart:1;
      pageSize = pageSize?pageSize:1000;
      // 构建 SELECT 查询
      const selectQuery = 'SELECT id FROM did_documents LIMIT ? OFFSET ?';
      // 构建 COUNT 查询
      const countQuery = 'SELECT COUNT(*) AS totalCount FROM did_documents';


      // 计算 OFFSET 值
      const offset = (pageStart - 1) * pageSize;

      // 执行 SELECT 操作
      const rows = await new Promise((resolve, reject) => {
        db.all(selectQuery, [pageSize, offset], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      // 执行 COUNT 操作
      const countResult = await new Promise((resolve, reject) => {
        db.get(countQuery, [], (err, result) => {
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
        errorCode: 100003,
        message: 'System error',
      };
    }

  }
  
}
