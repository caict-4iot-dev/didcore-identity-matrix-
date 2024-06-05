# 1.DID-TOOL使用说明

​		本节详细说明DID-TOOL常用接口文档。

## 1.1 DID-TOOL概述

### 1.1.1 架构介绍

+ tool： 项目集成组件，在此模块中可以通过插件方式集成其他三个业务组件并调用各自的方法。

+ key-manager： 密钥管理组件，提供密钥的生成、导出、签名和验签功能。

+ data-store： did和key存储组件，提供 did和可以的存储，修改，查询、删除等功能。

+ did-manager： did管理组件，提供did生成，存储，修改，删除，查询等功能。


## 2 tool
使用方式（以集成key-manager为例），具体执行详见tool/test/tooltest.spec.js
```javascript
import Tool from '../tool.js';
import KeyManager from 'key-manager/lib/index.js';

const mainApp = new Tool(); // 生成插件容器
const km = new KeyManager() // 实体化插件
mainApp.registerPlugin(km); // 使用容器注册插件

const generateResult1 = await mainApp.executeAllPluginsMethods(km, 'Generate'); // 执行KeyManager中的Generate方法
console.log('generateResult1:', generateResult1)
```
## 3 key-manager
### 3.1 generate
生成Ed25519VerificationKey2020
```javascript
//默认生成
Ed25519VerificationKey2020.generate();
//自定义seed
Ed25519VerificationKey2020.generate({seed})
//自定义seed ,controller
const keyPair = await Ed25519VerificationKey2020.generate({
            seed: seedBytes, controller: 'did:example:1234'
        });
//自定义publicKeyMultibase ,controller
const keyPair = new Ed25519VerificationKey2020(
        {controller, publicKeyMultibase});
```

响应示例
```javascript
Ed25519VerificationKey2020 
{
  id: undefined,
  controller: undefined,
  revoked: undefined,
  type: 'Ed25519VerificationKey2020',
  publicKeyMultibase: 'z6MkvCCw9XG7W5vEh762pJctYAVhQ8tXdUhJhoU3j2FTNAhi',
  privateKeyMultibase: 'zrv5BpzRf6rxf3upk5UpNpYx6KPYq6VwRo7SjX2b4xsVXdwTkdN7PNhSoB7p2kYzbKjPV35HqhQNcG9UjsLgZjCq8Va'
}
```

### 3.2 导出
```javascript
  const keyPair = await Ed25519VerificationKey2020.generate({
        id: 'did:ex:123#test-id'
      });
  const exported = await keyPair.export({publicKey: true});
  console.log('keyPair:',keyPair)
  console.log('exported:',exported)
```

响应
```javascript
keyPair: Ed25519VerificationKey2020 
{
  id: 'did:ex:123#test-id',
  controller: undefined,
  revoked: undefined,
  type: 'Ed25519VerificationKey2020',
  publicKeyMultibase: 'z6MkwKVEXrVDEENJfXzWhiNvuonhs3VeVRdPtR5qGdHgYgAi',
  privateKeyMultibase: 'zrv52vafmqqFuzgEDRazRet9CtGxFJ3D5myVctrhJQXTuVpHaTP9BRSjp7zaNza29F9RBz8191D7tJMC93kHwX1XeFg'
}
exported: {
  id: 'did:ex:123#test-id',
  type: 'Ed25519VerificationKey2020',
  publicKeyMultibase: 'z6MkwKVEXrVDEENJfXzWhiNvuonhs3VeVRdPtR5qGdHgYgAi'
}
```

### 3.3签名/验签
```javascript
 const {publicKeyMultibase} = mockKey;
 const controller = 'did:example:1234';

const keyPair = new Ed25519VerificationKey2020(
        {controller, publicKeyMultibase});

const signer = keyPair.signer();
const verifier = keyPair.verifier();
//签名
const data = stringToUint8Array('test 1234');
const signature = await signer.sign({data});
//验签
const result = await verifier.verify({data, signature});
```

## 4 data-store

### 4.1 导入did

```javascript
// 导入did
const saveDidDocument = await DidStore.ImportDID(jsonData, storageType);
```

### 4.2 编辑did

```javascript
// 编辑did
const updatDidDocument = await DidStore.UpdateDID(jsonData, storageType);
```

### 4.3 查询did文档

```javascript
// 查询did
const didDocument = await DidStore.GetDID(did, storageType);
console.log("didDocument:", didDocument);
```

返回：

```javascript
didDocument: {
  errorCode: 0,
  message: 'SUCCESS',
  data: {
    didDocument: DidDocument {
      '@context': [Array],
      id: 'did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYA',
      verificationMethod: [Array],
      authentication: [Array],
      extension: [Object],
      service: [Array],
      created: '2021-05-10T06:23:38Z',
      updated: '2021-05-10T06:23:38Z',
      proof: [Object]
    }
  }
}
```

### 4.4 删除did

```javascript
// 删除did
const result = await DidStore.DeleteDID(did, storageType);
```

### 4.5 did列表

```javascript
// 导入did
const didList = await DidStore.ListDIDs(pageStart, pageSize, storageType);
console.log("didList:", didList);
```

返回

```javascript
didList: {
  errorCode: 0,
  message: 'SUCCESS',
  page: { pageStart: 1, pageSize: 1000, pageTotal: 5 },
  dataList: [
    'did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYA',
    'did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYB',
    'did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYC',
    'did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYD',
    'did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYE'
  ]
}
```

### 4.6 导入key

```javascript
// 导入key
const saveKey = await KeyStoreManager.ImportKey(jsonData, password, storageType);
```

### 4.7 编辑key

```javascript
// 编辑key
const updateKey = await KeyStoreManager.UpdateKey(jsonData, password, storageType);
```

### 4.8 查询key

```javascript
// 导入did
const key = await DidStore.GetKey(kid, password, storageType);
console.log("key:", key);
```

返回：

```javascript
key: {
  errorCode: 0,
  message: 'SUCCESS',
  data: {
    keyDocument: {
      id: 'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89f',
      type: 'Ed25519VerificationKey2020',
      controller: 'did:example:1234',
      publicKeyMultibase: 'z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C',
      privateKeyMultibase: 'zrv1mHUXWkWUpThaapTt8tkxSotE1iSRRuPNarhs3vTn2z61hQESuKXG7zGQsePB7JHdjaCzPZmBkkqULLvoLHoD82a',
      revoked: '2020-12-16T16:00:00Z'
    }
  }
}
```

### 4.9 删除key

```javascript
// 删除key
const result = await KeyStoreManager.DeleteKey(kid, storageType);
```

### 4.10 key列表

```javascript
// key列表
const keyList = await KeyStoreManager.ListKeys(pageStart, pageSize, storageType)
console.log("keyList:", keyList);
```

返回：

```javascript
keyList: {
  errorCode: 0,
  message: 'SUCCESS',
  page: { pageStart: 1, pageSize: 1000, pageTotal: 6 },
  dataList: [
    'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89M',
    'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89N',
    'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89O',
    'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89a',
    'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89aa',
    'did:example:1234#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89q'
  ]
}
```

## 5 did-manager

### 5.1 创建did

```javascript
// 创建did
const didDocument = await DidManager.DidManagerCreate();
console.log("didDocument:", didDocument);
```

返回：

```javascript
didDocument: {
  errorCode: 0,
  message: 'SUCCESS',
  data: {
    didDocument: {
      '@context': [Array],
      id: 'did:example:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYNOP',
      verificationMethod: [Array],
      authentication: [Array],
      extension: [Object],
      service: [Array],
      created: '2021-05-10T06:23:38Z',
      updated: '2021-05-10T06:23:38Z',
      proof: [Object]
    }
  }
}
```

### 5.2 导入did

```javascript
// 编辑did
const didDocumentImport = await DidManager.DidManagerImport(jsonData, storageType);
```

### 5.3 查询did文档

```javascript
// 查询did
const didDocument = await DidManager.DidManagerFind(did, storageType);
```

返回：

```javascript
didDocument: {
  errorCode: 0,
  message: 'SUCCESS',
  data: {
    didDocument: DidDocument {
      '@context': [Array],
      id: 'did:bid:efYGggWARD5GN5TMmMcxm7XRa9DJXRLPWRETLYA',
      verificationMethod: [Array],
      authentication: [Array],
      extension: [Object],
      service: [Array],
      created: '2021-05-10T06:23:38Z',
      updated: '2021-05-10T06:23:38Z',
      proof: [Object]
    }
  }
}
```

### 5.4 编辑did

```javascript
// 编辑did
const result = await DidManager.DidManagerUpdate(jsonData, storageType);
```

### 5.5 did文档增加管理密钥

```javascript
// did文档增加管理密钥
const result = await DidManager.DidManageraddKey(did,kid, storageType);
    
```

### 5.6 did文档移除管理密钥

```javascript
// did文档移除管理密钥
const result = await DidManager.DidManagerRemoveKey(did,kid, storageType)
```

### 5.7 did文档增加service

```javascript
// did文档增加service
const result = await DidManager.DidManagerAddService(did,serviceData, storageType)
```

### 4.8 did文档移除service

```javascript
// did文档移除service
const result = await DidManager.DidManagerRemoveService(did,serviceId, storageType);
```

### 5.9 删除did

```javascript
// 删除did
const result = await DidManager.DidManagerDelete(did, storageType);
```

### 5.10 验签

```javascript
// 验签
const verify = await DidManager.Verify(didDocument, publicKeyMultibase);
```

返回：

```javascript
verify: { 
    errorCode: 0, 
    message: 'SUCCESS', 
    data: { 
        verify: true 
    } 
}
```























