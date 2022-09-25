import { ParseCNFT, CNFT_ERROR_TYPES } from '../index';

export const nftMocks = {
    simpleNft: {
        "721": {
            "ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c": {
                "bit_bot 0x0000": {
                    "image": "ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9",
                    "mediaType": "image/svg",
                    "name": "bit_bot 0x0000",
                    "project": "bit_bots",
                }
            }
        }
    },
    invalidMetadatum : {
        "0": {
            "ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c": {
                "bit_bot 0x0000": {
                    "image": "ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9",
                    "mediaType": "image/svg",
                    "name": "bit_bot 0x0000",
                    "project": "bit_bots",
                    "Lucky Fruit": "🍒 🍓 🍊",
                }
            }
        }
    },
    multiplePolicies:{
        "721": {
            "ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c": {
                "bit_bot 0x0000": {
                }
            },
            "00000000000000000000000000000000000000000000000000000000": {
                "bit_bot 0x0000": {
                }
            }

        }
    }
}

test('Valid', () => {
  expect(ParseCNFT('{}')).toBeTruthy();
});

describe('JSON tests', () => {
  it('Invalid json throws json error', () => {
    const res = ParseCNFT('{')
    expect(res?.error?.type).toBe(CNFT_ERROR_TYPES.json);
  });

  it('Empty json throws json error', () => {
    const res = ParseCNFT('{}')
    expect(res?.error?.type).toBe(CNFT_ERROR_TYPES.json);
  });
})

describe('NFT 721 tag tests', () => {
  it('Valid 721 tag', () => {
    const mockedData = {
      "721": {
        "ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c": {
            "bit_bot 0x0000": {
                "image": "ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9",
                "mediaType": "image/svg",
                "name": "bit_bot 0x0000",
                "project": "bit_bots",
            }
        }
      }
    }
    const res = ParseCNFT(JSON.stringify(mockedData))
    expect(res?.error?.type).toBe(CNFT_ERROR_TYPES.json);
  });

  it('Empty json throws json error', () => {
    const res = ParseCNFT('{}')
    expect(res?.error?.type).toBe(CNFT_ERROR_TYPES.json);
  });
})

test('simpleNft', () => {
  const res = ParseCNFT(JSON.stringify(nftMocks.simpleNft))
  expect(res.error).toBeNull();
  expect(res.data !== null)
  expect(res.data?.policyId).toBe("ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c")
  //expect(res.data?.name).toBe("bit_bot 0x0000")
});

test('NFT with no 721', () => {
  const res = ParseCNFT(JSON.stringify({}))
  expect(res?.error?.message).toBe("Missing 721 metadatum tag");
});