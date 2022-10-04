import { ParseCNFT } from '../index';
import { MetadataErrors, NftExtensions, NftTypes } from '../types/types';

describe('JSON tests', () => {
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
  it('Valid 721 tag', () => {
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
    expect(error).toBeNull();
  });

  it('Non 721 metadatum tag throws CIP error', () => {
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

describe('Error checks', () => {
  it('Invalid image array lengths', () => {
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

  it('onchain tag check', () => {
    const mockedNFT = {
      '721': {
        ba3afde69bb939ae4439c36d220e6b2686c6d3091bbc763ac0a1679c: {
          test: {
            image: 'ipfs://QmQJfWDun8h6ucvLpm7Z15zNbW3tBCUsgXpkZ8ETCisgm9',
            mediaType: 'image/svg',
            name: 'test',
            project: 'bit_bots',
          },
        },
      },
    };
    const { data } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(data?.assets[0]?.nftType).toBe(NftTypes.ipfs);
  });
});

describe('Handle nft metadata sizes', () => {
  it('metadata is too large generates error', () => {
    const mockedNFT = require('./__mocks__/diffSizeNfts/greaterThanMaxTxSizeNFT.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    // TODO: add error types
    expect(error?.type).toBe(MetadataErrors.cip25);
  });
  it('metadata is exact size no error', () => {
    const mockedNFT = require('./__mocks__/diffSizeNfts/maxTxSizeNFT.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    // TODO: add error types
    expect(error?.message).toBe(null || undefined);
  });
  it('metadata is too large generates error', () => {
    const mockedNFT = require('./__mocks__/diffSizeNfts/lessThanMaxTxSizeNFT.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    // TODO: add error types
    expect(error?.message).toBe(null || undefined); //TODO: this should not be null or undefined
  });
});

describe('Handle "ext" tag (extensions)', () => {
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
    expect(error).toBeNull();
    if (!data?.ext) {
      throw new Error('ext should be defined');
    }
    expect(data?.ext).toContain('cip48');
  });
});

describe('refactor', () => {
  it('no image but contains files', () => {
    const mockedNFT = require('./__mocks__/errorNfts/noImagePropButFiles.json');
    console.log(JSON.stringify(mockedNFT));
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error?.type).toBe(MetadataErrors.cip25);
  });

  it('ref test 0', () => {
    const mockedNFT = require('./__mocks__/referenceAndPayloads/ext48.json');
    console.log(JSON.stringify(mockedNFT));
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    if (!data?.ext) throw new Error('ext should be defined');
    expect(data?.ext[0]).toBe('cip48');

    if (!data.assets[0].references) throw new Error('refs should be defined');
    expect(data.assets[0].references[0].type).toBe('policy');
    expect(data.assets[0].references[0].target).toBe('00000000000000000000000000000000000000000000000000000000');

    expect(error).toBeUndefined();
  });
});
