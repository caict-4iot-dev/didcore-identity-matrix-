import {
  sign,
  verify,
  createPrivateKey,
  createPublicKey,
  randomBytes
} from 'crypto';
import {assertKeyBytes} from './validators.js';
import {promisify} from 'util';

const randomBytesAsync = promisify(randomBytes);

// used to export node's public keys to buffers
const publicKeyEncoding = {format: 'der', type: 'spki'};
// used to turn private key bytes into a buffer in DER format
const DER_PRIVATE_KEY_PREFIX = Buffer.from(
  '302e020100300506032b657004220420', 'hex');
// used to turn public key bytes into a buffer in DER format
const DER_PUBLIC_KEY_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

const api = {
  async generateKeyPairFromSeed(seedBytes) {
    const privateKey = await createPrivateKey({
      // node is more than happy to create a new private key using a DER
      key: privateKeyDerEncode({seedBytes}),
      format: 'der',
      type: 'pkcs8'
    });
    // this expects either a PEM encoded key or a node privateKeyObject
    const publicKey = await createPublicKey(privateKey);
    const publicKeyBuffer = publicKey.export(publicKeyEncoding);
    const publicKeyBytes = getKeyMaterial(publicKeyBuffer);
    return {
      publicKey: publicKeyBytes,
      secretKey: Buffer.concat([seedBytes, publicKeyBytes])
    };
  },
  // generates an ed25519 key using a random seed
  async generateKeyPair() {
    const seed = await randomBytesAsync(32);
    return api.generateKeyPairFromSeed(seed);
  },
  async sign(privateKeyBytes, data) {
    const privateKey = await createPrivateKey({
      key: privateKeyDerEncode({privateKeyBytes}),
      format: 'der',
      type: 'pkcs8'
    });
    return sign(null, data, privateKey);
  },
  async verify(publicKeyBytes, data, signature) {
    const publicKey = await createPublicKey({
      key: publicKeyDerEncode({publicKeyBytes}),
      format: 'der',
      type: 'spki'
    });
    return verify(null, data, publicKey, signature);
  }
};

export default api;

function getKeyMaterial(buffer) {
  if(buffer.indexOf(DER_PUBLIC_KEY_PREFIX) === 0) {
    return buffer.slice(DER_PUBLIC_KEY_PREFIX.length, buffer.length);
  }
  if(buffer.indexOf(DER_PRIVATE_KEY_PREFIX) === 0) {
    return buffer.slice(DER_PRIVATE_KEY_PREFIX.length, buffer.length);
  }
  throw new Error('Expected Buffer to match Ed25519 Public or Private Prefix');
}

function privateKeyDerEncode({privateKeyBytes, seedBytes}) {
  if(!(privateKeyBytes || seedBytes)) {
    throw new TypeError('`privateKeyBytes` or `seedBytes` is required.');
  }
  if(!privateKeyBytes) {
    assertKeyBytes({
      bytes: seedBytes,
      expectedLength: 32
    });
  }
  if(!seedBytes) {
    assertKeyBytes({
      bytes: privateKeyBytes,
      expectedLength: 64
    });
  }
  let p;
  if(seedBytes) {
    p = seedBytes;
  } else {
    // extract the first 32 bytes of the 64 byte private key representation
    p = privateKeyBytes.slice(0, 32);
  }
  return Buffer.concat([DER_PRIVATE_KEY_PREFIX, p]);
}

function publicKeyDerEncode({publicKeyBytes}) {
  assertKeyBytes({
    bytes: publicKeyBytes,
    expectedLength: 32,
    code: 'invalidPublicKeyLength'
  });
  return Buffer.concat([DER_PUBLIC_KEY_PREFIX, publicKeyBytes]);
}
