
import * as base58 from 'base58-universal';
import {assertKeyBytes} from './validators.js';
import keyPair from './keyPair.js';
import {LDKeyPair} from 'crypto-ld';

const SUITE_ID = 'Ed25519VerificationKey2020';
// multibase base58-btc header
const MULTIBASE_BASE58_HEADER = 'z';
// multicodec ed25519-pub header as varint
const MULTICODEC_ED25519_PUB_HEADER = new Uint8Array([0xed, 0x01]);
// multicodec ed25519-priv header as varint
const MULTICODEC_ED25519_PRIV_HEADER = new Uint8Array([0x80, 0x26]);

export class Ed25519VerificationKey2020 extends LDKeyPair {

  constructor(options = {}) {
    super(options);
    this.type = SUITE_ID;
    const {publicKeyMultibase, privateKeyMultibase} = options;

    if(!publicKeyMultibase) {
      throw new TypeError('The "publicKeyMultibase" property is required.');
    }

    if(!publicKeyMultibase || !_isValidKeyHeader(
      publicKeyMultibase, MULTICODEC_ED25519_PUB_HEADER)) {
      throw new Error(
        '"publicKeyMultibase" has invalid header bytes: ' +
        `"${publicKeyMultibase}".`);
    }

    if(privateKeyMultibase && !_isValidKeyHeader(
      privateKeyMultibase, MULTICODEC_ED25519_PRIV_HEADER)) {
      throw new Error('"privateKeyMultibase" has invalid header bytes.');
    }

    // assign valid key values
    this.publicKeyMultibase = publicKeyMultibase;
    this.privateKeyMultibase = privateKeyMultibase;

    // set key identifier if controller is provided
    if(this.controller && !this.id) {
      this.id = `${this.controller}#${this.fingerprint()}`;
    }
    // check that the passed in keyBytes are 32 bytes
    assertKeyBytes({
      bytes: this._publicKeyBuffer,
      code: 'invalidPublicKeyLength',
      expectedLength: 32
    });
  }
  fingerprint() {
    return this.publicKeyMultibase;
  }
  static async from(options) {
    if(options.type === 'Ed25519VerificationKey2020') {
      return new Ed25519VerificationKey2020(options);
    }
    return 'invalid type';
  }

  static async generate({seed, ...keyPairOptions} = {}) {
    let keyObject;
    if(seed) {
      keyObject = await keyPair.generateKeyPairFromSeed(seed);
    } else {
      keyObject = await keyPair.generateKeyPair();
    }
    const publicKeyMultibase =
      _encodeMbKey(MULTICODEC_ED25519_PUB_HEADER, keyObject.publicKey);

    const privateKeyMultibase =
      _encodeMbKey(MULTICODEC_ED25519_PRIV_HEADER, keyObject.secretKey);

    return new Ed25519VerificationKey2020({
      publicKeyMultibase,
      privateKeyMultibase,
      ...keyPairOptions
    });
  }

  /**
   * @returns {Uint8Array} Public key bytes.
   */
  get _publicKeyBuffer() {
    if(!this.publicKeyMultibase) {
      return;
    }
    // remove multibase header
    const publicKeyMulticodec =
      base58.decode(this.publicKeyMultibase.substr(1));
    // remove multicodec header
    const publicKeyBytes =
      publicKeyMulticodec.slice(MULTICODEC_ED25519_PUB_HEADER.length);

    return publicKeyBytes;
  }

  /**
   * @returns {Uint8Array} Private key bytes.
   */
  get _privateKeyBuffer() {
    if(!this.privateKeyMultibase) {
      return;
    }
    // remove multibase header
    const privateKeyMulticodec =
      base58.decode(this.privateKeyMultibase.substr(1));
    // remove multicodec header
    const privateKeyBytes =
      privateKeyMulticodec.slice(MULTICODEC_ED25519_PRIV_HEADER.length);

    return privateKeyBytes;
  }


  /**
   * Exports the serialized representation of the KeyPair
   * and other information that JSON-LD Signatures can use to form a proof.
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {boolean} [options.publicKey] - Export public key material?
   * @param {boolean} [options.privateKey] - Export private key material?
   * @param {boolean} [options.includeContext] - Include JSON-LD context?
   *
   * @returns {object} A plain js object that's ready for serialization
   *   (to JSON, etc), for use in DIDs, Linked Data Proofs, etc.
   */
  export({publicKey = false, privateKey = false, includeContext = false} = {}) {
    if(!(publicKey || privateKey)) {
      throw new TypeError(
        'Export requires specifying either "publicKey" or "privateKey".');
    }
    const exportedKey = {
      id: this.id,
      type: this.type
    };
    if(includeContext) {
      exportedKey['@context'] = Ed25519VerificationKey2020.SUITE_CONTEXT;
    }
    if(this.controller) {
      exportedKey.controller = this.controller;
    }
    if(publicKey) {
      exportedKey.publicKeyMultibase = this.publicKeyMultibase;
    }
    if(privateKey) {
      exportedKey.privateKeyMultibase = this.privateKeyMultibase;
    }
    if(this.revoked) {
      exportedKey.revoked = this.revoked;
    }
    return exportedKey;
  }
  signer() {
    const privateKeyBuffer = this._privateKeyBuffer;

    return {
      async sign({data}) {
        if(!privateKeyBuffer) {
          throw new Error('A private key is not available for signing.');
        }
        return keyPair.sign(privateKeyBuffer, data);
      },
      id: this.id
    };
  }

  verifier() {
    const publicKeyBuffer = this._publicKeyBuffer;

    return {
      async verify({data, signature}) {
        if(!publicKeyBuffer) {
          throw new Error('A public key is not available for verifying.');
        }
        return keyPair.verify(publicKeyBuffer, data, signature);
      },
      id: this.id
    };
  }
}
// Used by CryptoLD harness for dispatching.
Ed25519VerificationKey2020.suite = SUITE_ID;
// Used by CryptoLD harness's fromKeyId() method.
Ed25519VerificationKey2020.SUITE_CONTEXT =
  'https://w3id.org/security/suites/ed25519-2020/v1';

// check a multibase key for an expected header
function _isValidKeyHeader(multibaseKey, expectedHeader) {
  if(!(typeof multibaseKey === 'string' &&
    multibaseKey[0] === MULTIBASE_BASE58_HEADER)) {
    return false;
  }

  const keyBytes = base58.decode(multibaseKey.slice(1));
  return expectedHeader.every((val, i) => keyBytes[i] === val);
}

// encode a multibase base58-btc multicodec key
function _encodeMbKey(header, key) {
  const mbKey = new Uint8Array(header.length + key.length);

  mbKey.set(header);
  mbKey.set(key, header.length);

  return MULTIBASE_BASE58_HEADER + base58.encode(mbKey);
}
export default Ed25519VerificationKey2020;
