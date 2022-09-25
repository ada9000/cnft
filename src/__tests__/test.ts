import { ParseCNFT, CNFT_ERROR_TYPES } from '../index';

describe('JSON tests', () => {
  it('Invalid json throws json error', () => {
    const res = ParseCNFT('{')
    expect(res?.error?.type).toBe(CNFT_ERROR_TYPES.json);
  });

  it('Empty json throws missing metadatum error', () => {
    const res = ParseCNFT('{}')
    console.log(res.error)
    expect(res?.error?.type).toBe(CNFT_ERROR_TYPES.cip25);
  });
})

describe('NFT 721 tag tests', () => {
  it('Valid 721 tag', () => {
    const mockedNFT = 
    {
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
    const res = ParseCNFT(JSON.stringify(mockedNFT))
    expect(res?.error).toBeNull();
  });

  it('Non 721 metadatum tag throws CIP error', () => {
    const mockedNFT = 
    {
        "42": {
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
    const res = ParseCNFT(JSON.stringify(mockedNFT))
    expect(res?.error?.type).toBe(CNFT_ERROR_TYPES.cip25);
  });
})


describe('Existing nft project tests', () => {
  
  it('ada handle', () => {
    const mockedNFT = {
      "721": {
        "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a": {
          "ada9000": {
            "augmentations": [],
            "core": {
              "handleEncoding": "utf-8",
              "og": 0,
              "prefix": "$",
              "termsofuse": "https://adahandle.com/tou",
              "version": 0
            },
            "description": "The Handle Standard",
            "image": "ipfs://QmaZ56m6ScGyzpYnGdSbp3z6jkMU7UZSuy7Azjnw8gzQMm",
            "name": "$ada9000",
            "website": "https://adahandle.com"
          }
        }
      }
    }
    const res = ParseCNFT(JSON.stringify(mockedNFT))
    expect(res.error).toBeNull()
    expect(res?.data?.policyId).toBe("f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a");
    console.log(res?.data?.assets)
    if(res?.data?.assets){
      expect(res?.data?.assets[0]).toBeDefined()
      expect(res?.data?.assets[0]?.assetName).toBe("ada9000");
      expect(res?.data?.assets[0]?.name).toBe("$ada9000");
      expect(res?.data?.assets[0]?.image).toBe("ipfs://QmaZ56m6ScGyzpYnGdSbp3z6jkMU7UZSuy7Azjnw8gzQMm");
      expect(res?.data?.assets[0]?.other?.website).toBe("https://adahandle.com");
      expect(res?.data?.assets[0]?.other?.name).toBeUndefined();
    } else {
      throw new Error("Undefined assset");
    }
  });
})