// import getResolver from '../lib/resolver.js'

import { resolver } from '../../index.js';

describe('Resolver Tests', () => {
  it('get resolver', async () => {
    const providerConfig = {
      rpcUrl: 'https://dev.uniresolver.io/1.0/identifiers',
      did:'did:bid:efeAfxWduXFTGfV7LtVRhtRLaigixcMf'
    }
    const Resolver =new resolver(providerConfig)
    const result = await Resolver.getPublicKey();
    console.log('result--->', result)
  });
});
