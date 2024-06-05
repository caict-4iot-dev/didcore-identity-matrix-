const Ajv = require("ajv");
const schema = require("./schema.json");

async function checkSchema (userData) {
  try {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(userData);
    let result = null;
    if (valid) {
      console.log("User data is valid!");
      result = true
    } else {
      console.log("User data is invalid:", validate.errors);
      result = false
    }

    return {
      errorCode: 0,
      data: result,
      message: 'success',
    };
  } catch (error) {
    return {
      errorCode: 100001,
      message: 'error'
    };
  }
}

module.exports = { checkSchema }