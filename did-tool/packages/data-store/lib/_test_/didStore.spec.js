import {DidStore} from '../../index.js';
import chai from "chai";
const should = chai.should();
const {expect} = chai;

describe('didStore Test', () => {


  // 正常JSON数据
  const jsonData = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYG",
    "verificationMethod": [{
      "id": "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLE#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLE",
      "publicKeyMultibase": "z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
    }],
    "authentication": [
      "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLE#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
    ],
    "extension": {
      "recovery": ["did:bid:efnVUgqQFfYeu97ABf6sGm3WFtVXHZB2#key-2"],
      "ttl": 86400,
      "delegateSign": {
        "signer": "did:bid:efJgt44mNDewKK1VEN454R17cjso3mSG#key-1",
        "signatureValue": "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19"
      },
      "type": 206,
      "attributes": [{
        "key": "contract",
        "desc": "智能合约地址",
        "encrypt": "false",
        "format": "text",
        "value": "did:bid:efJgt44mNDewKK1VEN454R17cjso3mSG"
      }]
    },
    "service": [{
      "id": "did:bid:ef24NBA7au48UTZrUNRHj2p3bnRzF3YCH#resolve",
      "type": "DIDResolver",
      "serviceEndpoint": "www.caict.cn"
    }],
    "created": "2021-05-10T06:23:38Z",
    "updated": "2021-05-10T06:23:38Z",
    "proof": {
      "creator": "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLE#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C",
      "signatureValue": "9E07CD62FE6CE0A843497EBD045C0AE9FD6E1845414D0ED251622C66D9CC927CC21DB9C09DFF628DC042FCBB7D8B2B4901E7DA9774C20065202B76D4B1C15900"
    }
  };

  // 错误JSON数据
  const jsonDataError = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYH",
    "verificationMethod": [],
    "authentication": [],
    "extension": {},
    "service": [],
    "created": "2021-05-10T06:23:38Z",
    "updated": "2021-05-10T06:23:38Z",
    "proof": {}
  };

  const storageType = "sqlite";
  
  it('save a DidDocument to the database', async () => {
    // 调用保存函数
    const saveDidDocument = await DidStore.ImportDID(jsonData, storageType);
    expect(saveDidDocument.errorCode).to.equal(0);

});

  it('save a DidDocument for Duplicate BID', async () => {
    // 调用保存函数重复
    const saveDidDocumentDuplicate  = await DidStore.ImportDID(jsonData, storageType);
    expect(saveDidDocumentDuplicate.errorCode).to.equal(100001);
  });

  it('get DidDocument for BID', async () => {

    // 从数据库中检索保存的 DidDocument
    const retrievedDidDocument = await DidStore.GetDID(jsonData.id, storageType)
    console.log('retrievedDidDocument:', retrievedDidDocument.data.didDocument);
    // 断言
    expect(retrievedDidDocument.errorCode).to.equal(0);

  });

  it('save a DidDocument for Document format error', async () => {
    
    // 调用保存函数
    const saveDidDocument = await DidStore.ImportDID(jsonDataError, storageType);
    expect(saveDidDocument.errorCode).to.equal(100002);

  });

  it('update a DidDocument to the database', async () => {

    jsonData.created = "2020-05-10T06:23:38Z";
    // 调用修改函数
    const saveDidDocument = await DidStore.UpdateDID(jsonData, storageType);
    expect(saveDidDocument.errorCode).to.equal(0);

    // 从数据库中检索保存的 DidDocument
    const retrievedDidDocument = await DidStore.GetDID(jsonData.id, storageType)

    console.log('jsonData.created:', jsonData.created);
    console.log('retrievedDidDocument.data:', retrievedDidDocument.data);
    // 断言检索到的 DidDocument 是否与保存的 DidDocument 一致
    // expect(retrievedDidDocument.data.didDocument).to.equal(jsonData);

  });

  it('query DidDocument List', async () => {

    // 从数据库中检索保存的 DidDocument
    const retrievedDidDocument = await DidStore.ListDIDs(1, 1000, storageType);
    console.log('DidList:', retrievedDidDocument);
    // 断言
    expect(retrievedDidDocument.errorCode).to.equal(0);

  });

  it('delete DidDocument for BID', async () => {

    // 从数据库中检索保存的 DidDocument
    console.log('jsonData.id:', jsonData.id);
    const retrievedDidDocument = await DidStore.DeleteDID(jsonData.id, storageType)

    console.log('retrievedDidDocument:', retrievedDidDocument);
    // 断言
    expect(retrievedDidDocument.errorCode).to.equal(0);

  });
  
  it('update a DidDocument for the document does not exist error', async () => {

    // 调用修改函数
    const saveDidDocument = await DidStore.UpdateDID(jsonData, storageType);
    // 断言
    expect(saveDidDocument.errorCode).to.equal(100003);

  });

  it('quert DidDocument for BID for the document does not exist error', async () => {

    // 从数据库中检索保存的 DidDocument
    const retrievedDidDocument = await DidStore.GetDID('did:bid:efYGggWARD5GN5TM', storageType)
    // 断言s
    expect(retrievedDidDocument.errorCode).to.equal(100003);

  });
});
