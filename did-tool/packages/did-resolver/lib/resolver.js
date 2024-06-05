import is from 'is-type-of'
import rp from 'request-promise'
import JSONbig from 'json-bigint'

export class resolver {
    constructor(options = {}) {
        this.rpcUrl = options.rpcUrl
        this.did = options.did
    }

    async _get () {
        const options = {
            method: 'GET',
            uri: `${this.rpcUrl}/${this.did}`,
            // json: true,
            timeout: 4000
        }
        let data = await rp(options)
        return JSONbig.parse(data)
    }

    /**
     * Get account information
     * @param  {String} address
     * @return {Object}
     */
    async getPublicKey () {
        if (!is.string(this.rpcUrl) || this.rpcUrl.trim().length != 0) {
              //调用did-manager
            }
        try {
            var res = await this._get()
        } catch (e) {
            return {
                errorCode:11007,
                errorDesc: 'Failed to connect to the network'
            }
        }
        return {
            errorCode: 0,
            data: res.didDocument.verificationMethod[0].publicKeyHex,
            message: 'success',
        }
    };

}

