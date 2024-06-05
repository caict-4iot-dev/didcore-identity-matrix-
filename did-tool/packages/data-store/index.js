import { didStore } from './lib/didStore.js';
import { keyStoreManager } from './lib/keyStoreManager.js';
import PluginInterface from 'tool/plugin-interface.js';

export class DidStore extends PluginInterface {
    static async ImportDID(jsonData, storageType) {
        return await didStore.importDID({ jsonData, storageType});
    }
    static async GetDID( did, storageType ) {
        return await didStore.getDID({ did, storageType });
    }
    static async UpdateDID(jsonData, storageType) {
        return await didStore.updateDID({ jsonData, storageType });
    }
    static async DeleteDID(did, storageType) {
        return await didStore.deleteDID({ did, storageType });
    }
    static async ListDIDs(pageStart, pageSize, storageType) {
        return await didStore.listDIDs({ pageStart, pageSize, storageType });
    }
}
export class KeyStoreManager extends PluginInterface {
    static async ImportKey(jsonData, password, storageType) {
        return keyStoreManager.importKey({ jsonData, password, storageType });
    }
    static async GetKey(kid, password, storageType) {
        return keyStoreManager.getKey({kid, password, storageType});
    }
    static async UpdateKey(jsonData, password, storageType) {
        return keyStoreManager.updateKey({ jsonData, password, storageType });
    }
    static async DeleteKey(kid, storageType) {
        return keyStoreManager.deleteKey({ kid, storageType });
    }
    static async ListKeys( pageStart, pageSize, storageType) {
        return keyStoreManager.listKeys({ pageStart, pageSize, storageType });
    }
}
export default {DidStore, KeyStoreManager}
