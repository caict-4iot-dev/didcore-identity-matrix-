const { decodeJWT } = require('../lib/decodeJWT.js')

describe('decodeJWT JWT Tests', () => {
  test('decode JWT', async () => {
    const result = await decodeJWT();
    console.log('result--->', result)
  });

});