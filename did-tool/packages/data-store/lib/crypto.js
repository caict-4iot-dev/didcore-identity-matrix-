'use strict'
import sjcl from 'brdc-sjcl';
import CryptoJS from 'crypto-js'

export class crypto {

    static scryptParams = {
        SCRYPT_PARAMS_COST_FACTOR: 16384,
        SCRYPT_PARAMS_BLOCK_SIZE_FACTOR: 8,
        SCRYPT_PARAMS_PARALLELIZATION_FACTOR: 1,
        SCRYPT_PARAMS_DK_LEN: 32
    }

    static async encrypt(password, origin) {

        const n = this.scryptParams.SCRYPT_PARAMS_COST_FACTOR
        const r = this.scryptParams.SCRYPT_PARAMS_BLOCK_SIZE_FACTOR
        const p = this.scryptParams.SCRYPT_PARAMS_PARALLELIZATION_FACTOR
        const dkLen = this.scryptParams.SCRYPT_PARAMS_DK_LEN
        let saltBits = sjcl.random.randomWords(8)
        let ivBits = sjcl.random.randomWords(4)
        const dk = sjcl.misc.scrypt(password, saltBits, n, r, p, dkLen * 8)
        const iv1 = CryptoJS.enc.Hex.parse(sjcl.codec.hex.fromBits(ivBits)) // bitarry => hex => CryptoJS
        const derivedKey = CryptoJS.enc.Hex.parse(sjcl.codec.hex.fromBits(dk))// bitarry => hex => CryptoJS
        let encrypted1 = CryptoJS.AES.encrypt(origin, derivedKey, {
            iv: iv1,
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.NoPadding
        })

        let cryptoData = {
            encrypted: encrypted1.ciphertext.toString(),
            iv: sjcl.codec.hex.fromBits(ivBits),
            salt: sjcl.codec.hex.fromBits(saltBits)
        }
        return cryptoData
    }
    static async decrypt(password, keystoreContent) {

        if (!keystoreContent) {
            throw new Error('require keystore')
        }
        if (!password) {
            throw new Error('require password')
        }
        if (typeof keystoreContent === 'string') {
            keystoreContent = JSON.parse(keystoreContent)
        }
        const n = this.scryptParams.SCRYPT_PARAMS_COST_FACTOR
        const r = this.scryptParams.SCRYPT_PARAMS_BLOCK_SIZE_FACTOR
        const p = this.scryptParams.SCRYPT_PARAMS_PARALLELIZATION_FACTOR
        const dkLen = this.scryptParams.SCRYPT_PARAMS_DK_LEN
        let cypherText = {}
        cypherText.ciphertext = CryptoJS.enc.Hex.parse(keystoreContent.cypher_text)
        let saltBits = sjcl.codec.hex.toBits(keystoreContent.scrypt_params.salt)
        const dk = sjcl.misc.scrypt(password, saltBits, n, r, p, dkLen * 8)
        const derivedKey = CryptoJS.enc.Hex.parse(sjcl.codec.hex.fromBits(dk))
        let decrypted = CryptoJS.AES.decrypt(cypherText, derivedKey, {
            mode: CryptoJS.mode.CTR,
            iv: CryptoJS.enc.Hex.parse(keystoreContent.aesctr_iv),
            padding: CryptoJS.pad.NoPadding
        })
        let respData = null
        try {
            respData = decrypted.toString(CryptoJS.enc.Utf8)
        } catch (e) {
        }
        return respData

    }
}
