import { didManager } from './lib/didManager.js';
import PluginInterface from 'tool/plugin-interface.js';

export class DidManager extends PluginInterface {
    static async DidManagerCreate() {
        return await didManager.didManagerCreate();
    }
    static async DidManagerImport( jsonData, storageType ) {
        return await didManager.didManagerImport({jsonData, storageType} );
    }
    static async DidManagerUpdate( jsonData, storageType ) {
        return await didManager.didManagerUpdate({ jsonData, storageType });
    }
    static async DidManagerDelete( did, storageType ) {
        return await didManager.didManagerDelete({ did, storageType });
    }
    static async DidManageraddKey( did,id, storageType ) {
        return await didManager.didManageraddKey({ did,id, storageType });
    }
    static async DidManagerRemoveKey( did,id, storageType ) {
        return await didManager.didManagerRemoveKey({ did,id, storageType });
    }
    static async DidManagerFind( did, storageType ) {
        return await didManager.didManagerFind({ did, storageType });
    }
    static async DidManagerAddService( did, jsonData, storageType ) {
        return await didManager.didManagerAddService({ did, jsonData, storageType });
    }
    static async DidManagerRemoveService( did, id, storageType ) {
        return await didManager.didManagerRemoveService({ did, id, storageType });
    }
    static async Verify( jsonData, publicKey ) {
        return await didManager.verify({ jsonData, publicKey });
    }
}

export default DidManager
