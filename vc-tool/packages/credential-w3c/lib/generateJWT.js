const didJWT = require('did-jwt');
// const { createVerifiableCredentialJwt } = require('did-jwt-vc');
async function generateJWT() {

    try {
        // const issuer = {
        //   did: 'did:key:z6Mkk2U8pdcHkdzKVBtLmCYYPAAGmrZ93LUSTKDrVp9uQzYu',
        //   signer: (data) => {
        //     // 实现你的签名逻辑
        //     // 返回签名结果
        //   },
        // };

        const privateKeyHex = 'zrv1NcjDfLk6YzoLECyGjD2zSwkQ6Fziibo2YETCAfyfe4zB5UEaN3GjixHHSVW5ePphN8KhvWM9EUJLRhR6BRTKgP1';
        const signer = didJWT.EdDSASigner(didJWT.multibaseToBytes(privateKeyHex));

        const vcPayload = {
            "exp": 1702745280,
            "vc": {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1"
                ],
                "type": [
                    "VerifiableCredential"
                ],
                "credentialSubject": {
                    "firstName": "郭",
                    "lastName": "世杰",
                    "email": "949552983@qq.com",
                    "type": "Sphereon Guest",
                    "id": "did:jwk:eyJhbGciOiJFUzI1NksiLCJ1c2UiOiJzaWciLCJrdHkiOiJFQyIsImNydiI6InNlY3AyNTZrMSIsIngiOiJJWEh1Uk5NeVZaSm9OeG56MVV2TUV1UzVoTll4TzFaV3Vac1UwOHc1UEZFIiwieSI6Illyb29IeDItNlBZMUVsZ0EzN3M4VHRlWDlySG9iZ0Vod1hLd0d0Q0hhQncifQ"
                }
            },
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "type": [
                "VerifiableCredential",
                "CaictCredential"
            ],
            "expirationDate": "2023-12-16T16:48:00.383Z",
            "credentialSubject": {
                "firstName": "郭",
                "lastName": "世杰",
                "email": "949552983@qq.com",
                "type": "CaictCredential",
                "id": "did:jwk:eyJhbGciOiJFUzI1NksiLCJ1c2UiOiJzaWciLCJrdHkiOiJFQyIsImNydiI6InNlY3AyNTZrMSIsIngiOiJJWEh1Uk5NeVZaSm9OeG56MVV2TUV1UzVoTll4TzFaV3Vac1UwOHc1UEZFIiwieSI6Illyb29IeDItNlBZMUVsZ0EzN3M4VHRlWDlySG9iZ0Vod1hLd0d0Q0hhQncifQ"
            },
            "issuer": "did:key:z6Mkk2U8pdcHkdzKWBtLmCYYPAAGmrZ93LUSTKDrVp9uQzYu",
            "issuanceDate": "2023-12-13T02:24:00.383Z",
            "sub": "did:jwk:eyJhbGciOiJFUzI1NksiLCJ1c2UiOiJzaWciLCJrdHkiOiJFQyIsImNydiI6InNlY3AyNTZrMSIsIngiOiJJWEh1Uk5NeVZaSm9OeG56MVV2TUV1UzVoTll4TzFaV3Vac1UwOHc1UEZFIiwieSI6Illyb29IeDItNlBZMUVsZ0EzN3M4VHRlWDlySG9iZ0Vod1hLd0d0Q0hhQncifQ",
            "nbf": 1702434240,
            "iss": "did:key:z6Mkk2U8pdcHkdzKWBtLmCYYPAAGmrZ93LUSTKDrVp9uQzYu"
        }

        const vcJwt = await didJWT.createJWT(
            vcPayload,
            { issuer: 'did:bid:efeAfxWduXFTGfV7LtVRhtRLaigixcMf', signer },
            { alg: 'ES256K' }
        )

        // const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer);
        return {
            errorCode: 0,
            data: vcJwt,
            message: 'success',
        };
    } catch (error) {
        return {
            errorCode: 100001,
            message: 'error'
        };
    }
}

module.exports = { generateJWT }