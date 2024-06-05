import {resolver} from './lib/resolver.js'
import PluginInterface from 'tool/plugin-interface.js'
class Resolver extends PluginInterface {
    static async GetPublicKey(providerConfig) {
        const Resolver = new resolver(providerConfig)
        const result = await Resolver.getPublicKey();
        return result
    }
}
export default Resolver
