import {KeyStoreManager} from '../../index.js';
import chai from "chai";
const should = chai.should();
const {expect} = chai;

describe('keyStore Test', () => {


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

  const storageType = "sqlite";
  
  it('save key to the database', async () => {

    // 调用保存函数
    const saveKey = await KeyStoreManager.ImportKey(jsonData, password, storageType);
    expect(saveKey.errorCode).to.equal(0);

  });

  it('save a Key for Duplicate key ID for the document error', async () => {

    // 调用保存函数重复
    const saveKeyDuplicate  = await KeyStoreManager.ImportKey(jsonData, password, storageType);
    expect(saveKeyDuplicate.errorCode).to.equal(200001);

  });

  it('save a Key for Password does not exist error', async () => {
    
    // 调用保存函数
    const saveKey = await KeyStoreManager.ImportKey(jsonData, "", storageType);
    expect(saveKey.errorCode).to.equal(200004);

  });
  it('save a Key for Document format error', async () => {
    
    // 调用保存函数
    const saveKey = await KeyStoreManager.ImportKey(jsonDataError, password, storageType);
    expect(saveKey.errorCode).to.equal(100002);

  });

  it('get Key test', async () => {

    // 从数据库中检索保存的 Key
    const retrievedKey = await KeyStoreManager.GetKey(jsonData.id, password, storageType)
    console.log("======>retrievedKey:", retrievedKey);
    // 断言s
    expect(retrievedKey.errorCode).to.equal(0);

  });

  it('get Key for Kid for Password error', async () => {

    // 从数据库中检索保存的 Key
    const retrievedKey = await KeyStoreManager.GetKey(jsonData.id, "8888", storageType)
    // 断言s
    expect(retrievedKey.errorCode).to.equal(200005);

  });
  it('update a Key to the database', async () => {

    jsonData.controller = "did:example:12345678910";
    // 调用修改函数
    const saveKey = await KeyStoreManager.UpdateKey(jsonData, password, storageType);
    expect(saveKey.errorCode).to.equal(0);

    // 从数据库中检索保存的 Key
    const retrievedKey = await KeyStoreManager.GetKey(jsonData.id, password, storageType)
    // 断言检索到的 Key 是否与保存的 Key 一致
    console.log(retrievedKey.data)
    expect(retrievedKey.data.keyDocument.controller).to.equal(jsonData.controller);

  });

  it('query Key List', async () => {

    // 从数据库中检索保存的 Key
    const retrievedKey = await KeyStoreManager.ListKeys(1, 1000, storageType)
    console.log('keyList:', retrievedKey);
    // 断言
    expect(retrievedKey.errorCode).to.equal(0);

  });

  it('delete Key for Kid', async () => {

    // 从数据库中检索保存的 Key
    const retrievedKey = await KeyStoreManager.DeleteKey(jsonData.id, storageType)
    // 断言
    expect(retrievedKey.errorCode).to.equal(0);

  });
  
  it('update a Key for the document does not exist error', async () => {

    // 调用修改函数
    const saveKey = await KeyStoreManager.UpdateKey(jsonData, password, storageType);
    // 断言
    expect(saveKey.errorCode).to.equal(200003);

  });

  it('get Key for Kid for the document does not exist error', async () => {

    // 从数据库中检索保存的 Key
    const retrievedKey = await KeyStoreManager.GetKey('did:bid:efYGggWARD5GN5TM', password, storageType)
    // 断言
    expect(retrievedKey.errorCode).to.equal(200003);

  });

});
