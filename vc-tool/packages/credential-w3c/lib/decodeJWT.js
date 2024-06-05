// const { jwtDecode } = require('jwt-decode');
const { generateJWT } = require('../lib/generateJWT.js');
const didJWT = require('did-jwt');

async function decodeJWT() {
  try {
    const vcJwt = await generateJWT();
    // const decodedToken = jwtDecode(token.data);
    const decodedToken = didJWT.decodeJWT(vcJwt.data, { complete: true });
    return {
      errorCode: 0,
      data: decodedToken.payload,
      message: 'success',
    };
  } catch (error) {
    return {
      errorCode: 100001,
      message: 'error',
    };
  }

}

module.exports = { decodeJWT }