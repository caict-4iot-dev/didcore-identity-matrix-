
export function assertKeyBytes({bytes, expectedLength = 32, code}) {
  if(!(bytes instanceof Uint8Array)) {
    throw new TypeError('"bytes" must be a Uint8Array.');
  }
  if(bytes.length !== expectedLength) {
    const error = new Error(
      `"bytes" must be a ${expectedLength}-byte Uint8Array.`);
    // we need DataError for invalid byte length
    error.name = 'DataError';
    // add the error code from the did:key spec if provided
    if(code) {
      error.code = code;
    }
    throw error;
  }
}
