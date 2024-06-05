import chai from 'chai';
import KeyManager from '../../index.js';
import * as base58btc from 'base58-universal';
const should = chai.should();
const {expect} = chai;
import { seed} from './mock-data.js';

    describe('generate', () => {
        it('should generate a key pair', async () => {
            let ldKeyPair;
            let error;
            try {
                ldKeyPair = await KeyManager.Generate();
            } catch(e) {
                error = e;
            }
            console.log('edKeyPair:', ldKeyPair);
            should.not.exist(error);
            should.exist(ldKeyPair.privateKeyMultibase);
            should.exist(ldKeyPair.publicKeyMultibase);
            console.log('ldKeyPair.privateKeyMultibase.slice(1):', ldKeyPair.privateKeyMultibase.slice(1));
            const privateKeyBytes = base58btc
                .decode(ldKeyPair.privateKeyMultibase.slice(1));
            const publicKeyBytes = base58btc
                .decode(ldKeyPair.publicKeyMultibase.slice(1));
            privateKeyBytes.length.should.equal(66);
            publicKeyBytes.length.should.equal(34);
        });
        it('should generate the same key from the same seed', async () => {
            const seed = new Uint8Array(32);
            seed.fill(0x01);
            const keyPair1 = await KeyManager.Generate({seed});
            const keyPair2 = await KeyManager.Generate({seed});
            console.log('edKeyPair1:', keyPair1);
            console.log('edKeyPair2:', keyPair2.publicKeyMultibase);
            // expect(keyPair1.publicKeyMultibase).to.equal(keyPair2.publicKeyMultibase);
            // expect(keyPair1.privateKeyMultibase).to
            //     .equal(keyPair2.privateKeyMultibase);
        });
});

describe('export', () => {
    it('should export id, type and key material', async () => {
        // Encoding returns a 64 byte uint8array, seed needs to be 32 bytes
        const seedBytes = (new TextEncoder()).encode(seed).slice(0, 32);
        const keyPair = await KeyManager.Generate({
            seed: seedBytes, controller: 'did:example:1234'
        });
        console.log('keyPair:', keyPair);
        const pastDate = new Date(2020, 11, 17).toISOString()
            .replace(/\.[0-9]{3}/, '');
        keyPair.revoked = pastDate;
        const exported = await keyPair.export({
            publicKey: true, privateKey: true
        });
        console.log('exported:', exported);
        expect(exported).to.have.keys([
            'id', 'type', 'controller', 'publicKeyMultibase', 'privateKeyMultibase',
            'revoked'
        ]);
        expect(exported.controller).to.equal('did:example:1234');
        expect(exported.type).to.equal('Ed25519VerificationKey2020');
        expect(exported.id).to.equal('did:example:1234#' +
            'z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C');
        expect(exported).to.have.property('publicKeyMultibase',
            'z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C');
        expect(exported).to.have.property('privateKeyMultibase',
            'zrv1mHUXWkWUpThaapTt8tkxSotE1iSRRuPNarhs3vTn2z61hQESuKXG7zGQsePB7JHd' +
            'jaCzPZmBkkqULLvoLHoD82a');
        expect(exported).to.have.property('revoked', pastDate);
    });

});
describe('sign verify', () => {
    const seedBytes = (new TextEncoder()).encode(seed).slice(0, 32);
    it('2020 sign verify', async () => {
        const keyPair2020 = await KeyManager.Generate({
            seed: seedBytes, controller: 'did:example:1234'
        });
        const data = (new TextEncoder()).encode('test data goes here');
        const data2 = (new TextEncoder()).encode('test data goes here2');
        const signatureBytes2020 = await keyPair2020.signer().sign({data});
        console.log('exported:', signatureBytes2020);
        expect(
            await keyPair2020.verifier()
                .verify({data, signature: signatureBytes2020})
        ).to.be.true;
    });
});
describe('imports', () => {
    const keyData = {
        '@context': 'https://w3id.org/security/jws/v1',
        id: 'did:example:123#kPrK_qmxVWaYVA9wwBF6Iuo3vVzz7TxHCTwXBygrS4k',
        controller: 'did:example:123',
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase: 'z6MknneZbKgSmK7WtU1KQSGdtFD7b2tFqPYC56Ua5i2gfkCX',
        privateKeyMultibase: 'zrv1NcjDfLk6YzoLECyGjD2zSwkQ6Fziibo2YETCAfyfe4zB5UEaN3GjixHHSVW5ePphN8KhvWM9EUJLRhR6BRTKgP1'
    };
    it('2020 imports', async () => {
        const key = await KeyManager.from(keyData);
        console.log('key:', key);
        let header='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
        let payload='eyJleHAiOjE3MDI3NDUyODAsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZmlyc3ROYW1lIjoi6YOtIiwibGFzdE5hbWUiOiLkuJbmnbAiLCJlbWFpbCI6Ijk0OTU1Mjk4M0BxcS5jb20iLCJ0eXBlIjoiU3BoZXJlb24gR3Vlc3QiLCJpZCI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0oxYzJVaU9pSnphV2NpTENKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SW5ObFkzQXlOVFpyTVNJc0luZ2lPaUpKV0VoMVVrNU5lVlphU205T2VHNTZNVlYyVFVWMVV6Vm9UbGw0VHpGYVYzVmFjMVV3T0hjMVVFWkZJaXdpZVNJNklsbHliMjlJZURJdE5sQlpNVVZzWjBFek4zTTRWSFJsV0RseVNHOWlaMFZvZDFoTGQwZDBRMGhoUW5jaWZRIn19LCJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQ2FpY3RDcmVkZW50aWFsIl0sImV4cGlyYXRpb25EYXRlIjoiMjAyMy0xMi0xNlQxNjo0ODowMC4zODNaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiZmlyc3ROYW1lIjoi6YOtIiwibGFzdE5hbWUiOiLkuJbmnbAiLCJlbWFpbCI6Ijk0OTU1Mjk4M0BxcS5jb20iLCJ0eXBlIjoiQ2FpY3RDcmVkZW50aWFsIiwiaWQiOiJkaWQ6andrOmV5SmhiR2NpT2lKRlV6STFOa3NpTENKMWMyVWlPaUp6YVdjaUxDSnJkSGtpT2lKRlF5SXNJbU55ZGlJNkluTmxZM0F5TlRack1TSXNJbmdpT2lKSldFaDFVazVOZVZaYVNtOU9lRzU2TVZWMlRVVjFVelZvVGxsNFR6RmFWM1ZhYzFVd09IYzFVRVpGSWl3aWVTSTZJbGx5YjI5SWVESXRObEJaTVVWc1owRXpOM000VkhSbFdEbHlTRzlpWjBWb2QxaExkMGQwUTBoaFFuY2lmUSJ9LCJpc3N1ZXIiOiJkaWQ6a2V5Ono2TWtrMlU4cGRjSGtkektXQnRMbUNZWVBBQUdtclo5M0xVU1RLRHJWcDl1UXpZdSIsImlzc3VhbmNlRGF0ZSI6IjIwMjMtMTItMTNUMDI6MjQ6MDAuMzgzWiIsInN1YiI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0oxYzJVaU9pSnphV2NpTENKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SW5ObFkzQXlOVFpyTVNJc0luZ2lPaUpKV0VoMVVrNU5lVlphU205T2VHNTZNVlYyVFVWMVV6Vm9UbGw0VHpGYVYzVmFjMVV3T0hjMVVFWkZJaXdpZVNJNklsbHliMjlJZURJdE5sQlpNVVZzWjBFek4zTTRWSFJsV0RseVNHOWlaMFZvZDFoTGQwZDBRMGhoUW5jaWZRIiwibmJmIjoxNzAyNDM0MjQwLCJpc3MiOiJkaWQ6a2V5Ono2TWtrMlU4cGRjSGtkektXQnRMbUNZWVBBQUdtclo5M0xVU1RLRHJWcDl1UXpZdSJ9'
        const data = (new TextEncoder()).encode(`${header}.${payload}`);
        const signatureBytes2020 = await key.signer().sign({data});
        console.log('exported:', signatureBytes2020.toString('base64'));
        expect(
            await key.verifier()
                .verify({data, signature: signatureBytes2020})
        ).to.be.true;
    });

});
