import { ParseCNFT } from '../index';
import { MetadataErrors, NftExtensions, NftTypes } from '../types/types';

describe('JSON validation tests', () => {
  it('Invalid json throws json error', () => {
    const { error } = ParseCNFT('{');
    expect(error?.type).toBe(MetadataErrors.json);
  });

  it('Empty json throws missing metadatum error', () => {
    const { error } = ParseCNFT('{}');
    expect(error?.type).toBe(MetadataErrors.cip25);
  });

  it('Unexpected token at pos 67', () => {
    const { error } = ParseCNFT('{"721":{"ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c":}}');
    expect(error?.type).toBe(MetadataErrors.json);
    expect(error?.message).toBe('Unexpected token } in JSON at position 67');
  });

  it('Invalid comma (after "TestProject")', () => {
    const { error } = ParseCNFT(
      `{
        "721": {
            "ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c": {
                "Test0": {
                    "image": "ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9",
                    "mediaType": "image/svg",
                    "name": "Albert the absurd",
                    "project": "TestProject",
                }
            }
        }
      }`,
    );
    expect(error?.type).toBe(MetadataErrors.json);
    expect(error?.message).toBe('Unexpected token } in JSON at position 363');
  });
});

describe('NFT 721 tag tests', () => {
  it('Valid 721 NFT passes with no errors', () => {
    const mockedNFT = {
      '721': {
        ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c: {
          'bit_bot 0x0000': {
            image: 'ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9',
            mediaType: 'image/svg',
            name: 'bit_bot 0x0000',
            project: 'bit_bots',
          },
        },
      },
    };
    const { error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeUndefined();
  });

  it('Incorrect MetaDatum tag throws and error', () => {
    const mockedNFT = {
      '42': {
        ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c: {
          'bit_bot 0x0000': {
            image: 'ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9',
            mediaType: 'image/svg',
            name: 'bit_bot 0x0000',
            project: 'bit_bots',
          },
        },
      },
    };
    const { error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe(MetadataErrors.cip25);
  });
});

describe('Image property', () => {
  it('No image tag returns an error, even when files are present', () => {
    const mockedNFT = require('./__mocks__/errorNfts/noImagePropButFiles.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe(MetadataErrors.cip25);
  });

  it('Invalid image array lengths throws error', () => {
    const mockedNFT = {
      '721': {
        '4bfa713fc28cdd2d5e2adb518ef1265f715e39ee5af0f7be14bfa8bf': {
          CTB02067: {
            image: [
              'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcma',
              'cvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4Ij48Y2lyY2xlIGN4PSa',
            ],
            mediaType: 'image/svg+xml',
            name: 'CardanoTrees Bonsai 02067',
          },
        },
      },
    };
    const { error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe(MetadataErrors.cip25);
  });
  it('Invalid image type throws error', () => {
    const mockedNFT = {
      '721': {
        '4bfa713fc28cdd2d5e2adb518ef1265f715e39ee5af0f7be14bfa8bf': {
          CTB02067: {
            image: 2,
            mediaType: 'image/svg+xml',
            name: 'CardanoTrees Bonsai 02067',
          },
        },
      },
    };
    const { error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe(MetadataErrors.cip25);
  });
});

describe('Handle nft metadata sizes', () => {
  it('metadata is too large generates error', () => {
    const mockedNFT = require('./__mocks__/diffSizeNfts/greaterThanMaxTxSizeNFT.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe('cip25');
    expect(error?.message).toBe("Metadata size is '16385' maxTxSize is '16384'");
  });
  it('metadata is exact size no error', () => {
    const mockedNFT = require('./__mocks__/diffSizeNfts/maxTxSizeNFT.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBe(undefined);
  });
  it('metadata is acceptable size passess', () => {
    const mockedNFT = require('./__mocks__/diffSizeNfts/lessThanMaxTxSizeNFT.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBe(undefined);
  });
});

describe('ext (extensions) property', () => {
  it('handle cip48', () => {
    const mockedNFT = {
      '721': {
        ext: ['cip48'],
        ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c: {
          'bit_bot 0x0000': {
            image: 'bit_bot 0x0000',
            refs: [
              {
                name: 'bit_bot 0x0000',
                mediaType: 'image/svg+xml;utf8',
                src: ['payloadA', 'payloadB'],
              },
            ],
            name: 'bit_bot 0x0000',
            project: 'bit_bots',
          },
        },
      },
    };
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeUndefined();
    if (!data?.ext) {
      throw new Error('ext should be defined');
    }
    expect(data?.ext).toContain('cip48');
  });
});

// TODO test image array with no media type
// TODO test image array with tag mediatype not mediaType
