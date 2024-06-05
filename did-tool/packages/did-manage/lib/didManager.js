
import BIFCoreSDK from "bifcore-sdk-nodejs";
import {DidStore} from 'data-store';

export class didManager {

  static async formatJson(jsonData) {
    const dateTimeString = new Date().toISOString().slice(0, -1) + 'Z';
    const didDocument = {};
    didDocument['@context'] = [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ];
    didDocument.id = jsonData.did;
    didDocument.verificationMethod = jsonData.keys;
    didDocument.authentication = jsonData.authentication;
    didDocument.extension = jsonData.extension;
    didDocument.service = jsonData.services?jsonData.services:[];
    didDocument.created = dateTimeString;
    didDocument.updated = dateTimeString;
    didDocument.proof = jsonData.proof?jsonData.proof:{};

    return didDocument;
  }

//创建
  static async didManagerCreate() {

    try {
      let bifCoreSDK = new BIFCoreSDK({
        host: 'http://test.bifcore.bitfactory.cn'
      });
      let keyPair = bifCoreSDK.keypair.getBidAndKeyPair();
      const address = keyPair.encAddress + "#key-1";
      const dateTimeString = new Date().toISOString().slice(0, -1) + 'Z';
      const jsonData = {
        "@context": [
          "https://www.w3.org/ns/did/v1",
          "https://w3id.org/security/suites/ed25519-2020/v1"
        ],
        "id": keyPair.encAddress,
        "verificationMethod": [{
          "id": address,
          "type": "Ed25519VerificationKey2020",
          "controller": keyPair.encAddress,
          "publicKeyMultibase": keyPair.encPublicKey
        }],
        "authentication": [
          address
        ],
        "extension": {
          "recovery": [keyPair.encAddress+"#key-2"],
          "ttl": 86400,
          "delegateSign": {
            "signer": address,
            "signatureValue": "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19"
          },
          "type": 206,
          "attributes": [{
            "key": "contract",
            "desc": "智能合约地址",
            "encrypt": "false",
            "format": "text",
            "value": "did:example:efJgt44mNDewKK1VEN454R17cjso3mSG"
          }]
        },
        "service": [{
          "id": "did:example:ef24NBA7au48UTZrUNRHj2p3bnRzF3YCH#resolve",
          "type": "DIDResolver",
          "serviceEndpoint": "www.caict.cn"
        }],
        "created": dateTimeString,
        "updated": dateTimeString
      };

      let didDocStr = JSON.stringify(jsonData);
      let sign = bifCoreSDK.keypair.sign(didDocStr, keyPair.encPrivateKey);
      const proof = {
        "creator": address,
        "signatureValue": sign
      }
      jsonData.proof = proof;
      return {
        errorCode: 0,
        message: 'SUCCESS',
        data: {
          didDocument: jsonData
        }
      };

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

//保存
  static async didManagerImport({jsonData, storageType} = {}) {

    try {

      const didDocument = await this.formatJson(jsonData);
      const saveDidDocument = DidStore.ImportDID(didDocument, storageType);
      return saveDidDocument;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

//修改
  static async didManagerUpdate({jsonData, storageType} = {}) {

    try {
      const didDocument = await this.formatJson(jsonData);
      const updateDidDocument = DidStore.UpdateDID(didDocument, storageType)
      return updateDidDocument;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }


//删除
  static async didManagerDelete({did, storageType} = {}) {

    try {
      const deleteDidDocument = DidStore.DeleteDID(did, storageType)
      return deleteDidDocument;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

//指定 DID 添加一个新的密钥
  static async didManageraddKey({did, id, storageType} = {}) {

    try {
      const didDocumentResult = await DidStore.GetDID(did, storageType)
      let didDocument = didDocumentResult.data.didDocument;
      didDocument.authentication.push(id)
      const updateDidDocument = await DidStore.UpdateDID(didDocument, storageType)
      return updateDidDocument;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

//指定 DID 移除一个新的密钥
  static async didManagerRemoveKey({did, id, storageType} = {}) {

    try {
      const didDocumentResult = DidStore.GetDID(did, storageType)
      let didDocument = (await didDocumentResult).data.didDocument;
      let authentication = didDocument.authentication
      const authenticationRemove = authentication.filter(item => item !== id);
      didDocument.authentication = authenticationRemove;
      const updateDidDocument = DidStore.UpdateDID(didDocument, storageType)
      return updateDidDocument;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

//查询指定 DID 的 DID 文档
  static async didManagerFind({did, storageType} = {}) {

    try {

      const didDocumentResult = DidStore.GetDID(did, storageType)

      return didDocumentResult;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

//指定 DID 添加一个service
  static async didManagerAddService({did, jsonData, storageType} = {}) {

    try {
      const didDocumentResult = DidStore.GetDID(did, storageType)
      let didDocument = (await didDocumentResult).data.didDocument;
      didDocument.service.push(jsonData)
      const updateDidDocument = DidStore.UpdateDID(didDocument, storageType)
      return updateDidDocument;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

//指定 DID 添加一个service
  static async didManagerRemoveService({did, id, storageType} = {}) {

    try {

      const didDocumentResult = DidStore.GetDID(did, storageType)
      let didDocument = (await didDocumentResult).data.didDocument;
      let service = didDocument.service
      const serviceRemove = service.filter(item => item.id !== id);
      didDocument.service = serviceRemove;
      const updateDidDocument = DidStore.UpdateDID(didDocument, storageType)
      return updateDidDocument;

    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }

  //验签
  static async verify({jsonData, publicKey } = {}) {

    try {
      if(jsonData.proof){
        const proof = jsonData.proof;
        delete jsonData.proof;
        let didDocStr = JSON.stringify(jsonData);
        let bifCoreSDK = new BIFCoreSDK({
          host: 'http://test.bifcore.bitfactory.cn'
        });
        const verify = bifCoreSDK.keypair.verify(didDocStr, proof.signatureValue, publicKey);
        return {
          errorCode: 0,
          message: 'SUCCESS',
          data: {
            verify: verify
          }
        };
      }else{
        return {
          errorCode: 100001,
          message: 'Document format error',
        };
      }
    } catch (error) {
      console.log('Error connecting to the database:', error);

      throw {
        errorCode: 400000,
        message: 'System error',
      };

    }
  }
}

