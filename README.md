# Parse CNFT

A package that parses Cardano NFT's

- Converts metadata json to easy to use types
- Rejects any invalid nfts in accordance with [cip25](https://cips.cardano.org/cips/cip25/#abstract)

## Support

- Support development by delegating to [9000](https://ada9000.io)
- See **Contributions** for code contributes

## Quickstart example

install with yarn
`yarn add parse-cnft`
or npm
`npm install parse-cnft`

```js
import { cnft } from 'parse-cnft';
import { Data } from 'parse-cnft/lib/types/types';

const metadataJsonString = `{
    "721": {
        "ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c": {
            "bit_bot 0x0000": {
                "image": "ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9",
                "mediaType": "image/svg",
                "name": "bit_bot 0x0000",
                "project": "bit_bots"
            }
        }
    }
}`;
const { data, errors } = cnft(metadataJsonString);
console.log(data?.policyId); // logs: ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c
console.log(data?.assets[0].name); // logs: bit_bot 0x0000
```

## Contributions

1. fork the repo and make changes
2. `npm install`
3. `npm test`
4. `npm run format`
5. `npm run lint`
6. Create a PR
