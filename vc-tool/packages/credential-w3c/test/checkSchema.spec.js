const { checkSchema } = require('../lib/checkSchema.js')

describe('AJV Validation Tests', () => {
  const userData = {
    credentialSubjectRequest: {
      name: "John Doe",
      email: "john@example.com"
    }
  };

  test('ajv test', async () => {
    const result = await checkSchema(userData);
    expect(result).toEqual(true);
  });

});