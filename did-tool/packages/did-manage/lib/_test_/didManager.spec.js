import {DidManager} from '../../index.js';
import chai from "chai";
const {expect} = chai;

describe('didStore Test', () => {


  // 正常JSON数据
  const jsonData = {
    "did": "did:fake:receiverWithMediation67",
    "keys": [
      {
        "type": "Ed25519",
        "kid": "didcomm-receiverWithMediation2Key-1",
        "publicKeyHex": "b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636",
        "privateKeyHex": "19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636"
      }
    ],
    "authentication": [
        "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLE#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
    ],
    "extension": {
        "recovery": ["did:bid:efnVUgqQFfYeu97ABf6sGm3WFtVXHZB2#key-2"],
        "ttl": 86400,
        "delegateSign ": {
            "signer": "did:bid:efJgt44mNDewKK1VEN454R17cjso3mSG#key-1",
            "signatureValue":"eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19"
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
    "services": [
      {
        "id": "msg4",
        "type": "DIDCommMessaging",
        "serviceEndpoint": [
          {
            "uri": "http://localhost:3002/messaging",
            "routingKeys": [
              "${mediator2.did}#${mediator2.keys[0].kid}",
              "${mediator.did}#${mediator.keys[0].kid}"
            ]
          }
        ]
      }
    ],
    "provider": "did:fake"
  };

  const storageType = "sqlite";
  
  it('didManagerCreate Test', async () => {
    // 调用保存函数
    const didDocumentCreate = await DidManager.DidManagerCreate();
    expect(didDocumentCreate.errorCode).to.equal(0);
  });

  it('didManagerImport Test', async () => {
      // 调用保存函数
      const didDocumentImport = await DidManager.DidManagerImport(jsonData, storageType);
      expect(didDocumentImport.errorCode).to.equal(0);
  });

  it('save a DidDocument for Duplicate BID for the document error', async () => {
    // 调用保存函数
    const saveDidDocument = await DidManager.DidManagerImport(jsonData, storageType);
    expect(saveDidDocument.errorCode).to.equal(100001);

  });

  it('update a DidDocument', async () => {

    jsonData.services.id = "did:fake:receiverWithMediation2";
    // 调用修改函数
    const saveDidDocument = await DidManager.DidManagerUpdate(jsonData, storageType);
    expect(saveDidDocument.errorCode).to.equal(0);

  });

  it('didManageraddKey test', async () => {

    const id = "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRPP#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C";

    const result = await DidManager.DidManageraddKey(jsonData.did,id, storageType)
    // 断言
    expect(result.errorCode).to.equal(0);

  });

  it('didManagerRemoveKey test', async () => {


    const result = await DidManager.DidManagerRemoveKey(jsonData.did,jsonData.extension[0], storageType)
    // 断言
    expect(result.errorCode).to.equal(0);

  });

  it('didManagerAddService test', async () => {

    const serviceData = {
      "id": "msg4asdsadsdsa",
      "type": "DIDCommMessaging",
      "serviceEndpoint": [
        {
          "uri": "http://localhost:3002/messaging",
          "routingKeys": [
            "${mediator2.did}#${mediator2.keys[0].kid}",
            "${mediator.did}#${mediator.keys[0].kid}"
          ]
        }
      ]
    }

    const result = await DidManager.DidManagerAddService(jsonData.did,serviceData, storageType);
    // 断言
    expect(result.errorCode).to.equal(0);

  });


  it('didManagerRemoveService test', async () => {

    const id = "did:fake:receiverWithMediation2";
    const result = await DidManager.DidManagerRemoveService(jsonData.did,id, storageType)
    // 断言
    expect(result.errorCode).to.equal(0);

  });

  it('didManagerFind test', async () => {

    const result = await DidManager.DidManagerFind(jsonData.did, storageType);
    // 断言
    expect(result.errorCode).to.equal(0);

  });

  it('delete didManagerDelete test', async () => {

    // 从数据库中检索保存的 DidDocument
    const result = await DidManager.DidManagerDelete(jsonData.did, storageType);
    // 断言
    expect(result.errorCode).to.equal(0);

  });

  it('didManagerCreate Test', async () => {
    // 调用保存函数
    const didDocumentCreate = await DidManager.DidManagerCreate();
    const didDocument = didDocumentCreate.data.didDocument;
    let publicKeyMultibase = didDocument.verificationMethod[0].publicKeyMultibase;
    const verify = await DidManager.Verify(didDocument, publicKeyMultibase);
    expect(verify.errorCode).to.equal(0);
    expect(verify.data.verify).to.equal(true);
    console.log("verify:", verify);
  });

});
