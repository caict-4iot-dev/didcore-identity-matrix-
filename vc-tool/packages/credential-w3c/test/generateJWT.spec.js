const { generateJWT } = require('../lib/generateJWT.js')

describe('generate JWT Tests', () => {
  test('generate JWT', async () => {
    const result = await generateJWT();
    console.log(result)
  });

});