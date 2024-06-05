// index.js or any other entry point
import Tool from '../tool.js';
import KeyManager from 'key-manager';
import {DidStore, KeyStoreManager} from 'data-store';
import {DidManager} from "did-manage";
import Resolver from "did-resolver";
import chai from "chai";
const should = chai.should();
const {expect} = chai;
import {seed} from "key-manager/lib/_tests_/mock-data.js";

const tool = new Tool();
const km = new KeyManager();
const ds = new DidStore();
const ksm = new KeyStoreManager();
const dm = new DidManager();
const rs = new Resolver()
tool.registerPlugin(km);
tool.registerPlugin(ds);
tool.registerPlugin(ksm);
tool.registerPlugin(dm);
tool.registerPlugin(rs);
describe('key-manager test', () => {
    it('should generate a key pair', async () => {
        const generateResult1 = await tool.executePluginMethods(km, 'Generate');
        console.log('generateResult1:', generateResult1)
    });
    it('should generate the same key from the same seed', async () => {
        const seed = new Uint8Array(32);
        const generateResult2 = await tool.executePluginMethods(km, 'Generate', {seed});
        console.log('generateResult2:', generateResult2)
    });
    it('export', async () => {
        const seedBytes = (new TextEncoder()).encode(seed).slice(0, 32);
        const keyPair = await tool.executePluginMethods(km, 'Generate', {seed:seedBytes,controller: 'did:example:1234'});
        console.log('keyPair:', keyPair);
        const exported = await keyPair.export({
            publicKey: true, privateKey: true
        });
        console.log('exported:', exported);
    });
    it('singer', async () => {
        const seedBytes = (new TextEncoder()).encode(seed).slice(0, 32);
        const keyPair = await tool.executePluginMethods(km, 'Generate', {seed:seedBytes,controller: 'did:example:1234'});
        console.log('keyPair:', keyPair);
        const data = (new TextEncoder()).encode('test data goes here');
        const signatureBytes2020 = await keyPair.signer().sign({data});
        console.log('signatureBytes2020:', signatureBytes2020);
        const verifyResult =  await keyPair.verifier().verify({data, signature: signatureBytes2020})
        console.log('verifyResult:', verifyResult);
    });
});
describe('didStore test', () => {
    // 正常JSON数据
    const jsonData = {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/ed25519-2020/v1"
        ],
        "id": "did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYC",
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
    it('save a DidDocument to the database', async () => {
        // 调用保存函数
        const saveDidDocument = await tool.executePluginMethods(ds, 'ImportDID', jsonData, "sqlite");
        expect(saveDidDocument.errorCode).to.equal(0);
    });
    it('get a DidDocument to the database', async () => {
        // 从数据库中检索保存的 DidDocument
        const retrievedDidDocument = await tool.executePluginMethods(ds, 'GetDID', jsonData.id, "sqlite");
        console.log('retrievedDidDocument:', retrievedDidDocument.data.didDocument);
        // 断言
        expect(retrievedDidDocument.errorCode).to.equal(0);
    });
    it('update a DidDocument to the database', async () => {
        jsonData.created = "2020-05-10T06:23:38Z";
        // 调用修改函数
        const saveDidDocument = await tool.executePluginMethods(ds, 'UpdateDID', jsonData, "sqlite");
        expect(saveDidDocument.errorCode).to.equal(0);
    });
    it('query DidDocument List', async () => {
        // 从数据库中检索保存的 DidDocument
        const retrievedDidDocument = await tool.executePluginMethods(ds, 'ListDIDs',1, 1000, "sqlite");
        console.log('DidList:', retrievedDidDocument);
        // 断言
        expect(retrievedDidDocument.errorCode).to.equal(0);
    });
    it('delete DidDocument for BID', async () => {
        // 从数据库中删除 DidDocument
        console.log('jsonData.id:', jsonData.id);
        const retrievedDidDocument = await tool.executePluginMethods(ds, 'DeleteDID', jsonData.id, "sqlite");
        console.log('retrievedDidDocument:', retrievedDidDocument);
        // 断言
        expect(retrievedDidDocument.errorCode).to.equal(0);
    });
});
describe('keyStore test', () => {

    // 正常JSON数据
    const jsonData = {
        "id": 'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89f',
        "type": 'Ed25519VerificationKey2020',
        "controller": 'did:example:1234',
        "publicKeyMultibase": 'z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C',
        "privateKeyMultibase":'zrv1mHUXWkWUpThaapTt8tkxSotE1iSRRuPNarhs3vTn2z61hQESuKXG7zGQsePB7JHdjaCzPZmBkkqULLvoLHoD82a',
        "revoked": '2020-12-16T16:00:00Z'
    };

    // 错误JSON数据
    const jsonDataError = {
        "id": 'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89FS',
        "type": 'Ed25519VerificationKey2020',
        "controller": '',
        "publicKeyMultibase": 'z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C',
        "privateKeyMultibase":'zrv1mHUXWkWUpThaapTt8tkxSotE1iSRRuPNarhs3vTn2z61hQESuKXG7zGQsePB7JHdjaCzPZmBkkqULLvoLHoD82a',
        "revoked": '2020-12-16T16:00:00Z'
    };

    const password = "bif8888";

    it('save key to the database', async () => {
        // 调用保存函数
        const saveKey = await tool.executePluginMethods(ksm, 'ImportKey', jsonData,password, "sqlite");
        expect(saveKey.errorCode).to.equal(0);
    });

    it('get Key test', async () => {
        // 从数据库中检索保存的 Key
        const retrievedKey = await tool.executePluginMethods(ksm, 'GetKey', jsonData.id, password, "sqlite");
        console.log("======>retrievedKey:", retrievedKey);
        // 断言s
        expect(retrievedKey.errorCode).to.equal(0);
    });

    it('update a Key to the database', async () => {
        jsonData.controller = "did:example:12345678910";
        // 调用修改函数
        const saveKey = await tool.executePluginMethods(ksm, 'UpdateKey', jsonData, password, "sqlite");
        expect(saveKey.errorCode).to.equal(0);
    });

    it('query Key List', async () => {
        // 从数据库中检索保存的 Key
        const retrievedKey = await tool.executePluginMethods(ksm, 'ListKeys', 1, 1000,"sqlite");
        console.log('DidList:', retrievedKey);
        // 断言
        expect(retrievedKey.errorCode).to.equal(0);
    });

    it('delete Key for Kid', async () => {
        // 从数据库中检索保存的 Key
        const retrievedKey = await tool.executePluginMethods(ksm, 'DeleteKey', jsonData.id, "sqlite");
        // 断言
        expect(retrievedKey.errorCode).to.equal(0);
    });
});
describe('didManage Test', () => {
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

    it('didManagerCreate Test', async () => {
        // 调用保存函数
        const didDocumentCreate = await tool.executePluginMethods(dm, 'DidManagerCreate');
        expect(didDocumentCreate.errorCode).to.equal(0);
    });

    it('didManagerImport Test', async () => {
        // 调用保存函数
        const didDocumentImport = await tool.executePluginMethods(dm, 'DidManagerImport',jsonData, "sqlite");
        expect(didDocumentImport.errorCode).to.equal(0);
    });

    it('update a DidDocument', async () => {
        jsonData.services.id = "did:fake:receiverWithMediation2";
        // 调用修改函数
        const saveDidDocument = await tool.executePluginMethods(dm, 'DidManagerUpdate',jsonData, "sqlite");
        expect(saveDidDocument.errorCode).to.equal(0);
    });

    it('didManageraddKey it', async () => {
        const result = await tool.executePluginMethods(dm, 'DidManageraddKey',jsonData.did,"did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRPP#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C", "sqlite");
        // 断言
        expect(result.errorCode).to.equal(0);
    });

    it('didManagerRemoveKey it', async () => {
        const result = await tool.executePluginMethods(dm, 'DidManagerRemoveKey',jsonData.did,jsonData.extension[0], "sqlite");
        // 断言
        expect(result.errorCode).to.equal(0);
    });

    it('didManagerAddService it', async () => {
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
        const result = await tool.executePluginMethods(dm, 'DidManagerAddService',jsonData.did,serviceData, "sqlite");
        // 断言
        expect(result.errorCode).to.equal(0);
    });

    it('didManagerRemoveService it', async () => {
        const result = await tool.executePluginMethods(dm, 'DidManagerRemoveService',jsonData.did,"did:fake:receiverWithMediation2", "sqlite");
        // 断言
        expect(result.errorCode).to.equal(0);
    });

    it('didManagerFind it', async () => {
        const result = await tool.executePluginMethods(dm, 'DidManagerFind',jsonData.did, "sqlite");
        // 断言
        expect(result.errorCode).to.equal(0);
    });

    it('delete didManagerDelete', async () => {
        // 从数据库中检索保存的 DidDocument
        const result = await tool.executePluginMethods(dm, 'DidManagerDelete',jsonData.did, "sqlite");
        // 断言
        expect(result.errorCode).to.equal(0);
    });
    it('didManagerCreate Test', async () => {
        // 调用保存函数
        const didDocumentCreate = await tool.executePluginMethods(dm, 'DidManagerCreate');
        const didDocument = didDocumentCreate.data.didDocument;
        let publicKeyMultibase = didDocument.verificationMethod[0].publicKeyMultibase;
        const verify = await tool.executePluginMethods(dm, 'Verify', didDocument, publicKeyMultibase);
        expect(verify.errorCode).to.equal(0);
        expect(verify.data.verify).to.equal(true);
    });

});
describe('did-resolver test', () => {
    it('get resolver', async () => {
        const providerConfig = {
            rpcUrl: 'https://dev.uniresolver.io/1.0/identifiers',
            did:'did:bid:efeAfxWduXFTGfV7LtVRhtRLaigixcMf'
        }
        const generateResult1 = await tool.executePluginMethods(rs, 'GetPublicKey', providerConfig);
        console.log('generateResult1:', generateResult1)
    });
});





