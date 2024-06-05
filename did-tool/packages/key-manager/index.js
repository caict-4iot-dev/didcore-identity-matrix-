import Ed25519VerificationKey2020 from './lib/Ed25519VerificationKey2020.js';
import PluginInterface from 'tool/plugin-interface.js'
class KeyManager extends PluginInterface {
    static async Generate({seed, ...keyPairOptions} = {}) {
        let ldKeyPair;
        let error;
        try {
            ldKeyPair = await Ed25519VerificationKey2020.generate({seed, ...keyPairOptions})
        } catch(e) {
            error = e;
        }
        return ldKeyPair
    }
    static async from(options) {
        let ldKeyPair;
        let error;
        try {
            ldKeyPair = await Ed25519VerificationKey2020.from(options)
        } catch(e) {
            error = e;
        }
        return ldKeyPair
    }
}
export default KeyManager

