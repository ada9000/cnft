import { ParseCNFT } from '../index';
import { NftTypes } from '../types/types';

describe('Existing nft project tests', () => {
  it('ada handle', () => {
    const mockedNFT = require('./__mocks__/realWorldNfts/adaHandle.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeNull();
    expect(data?.policyId).toBe('f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a');
    if (data?.assets) {
      expect(data?.assets[0]).toBeDefined();
      expect(data?.assets[0]?.assetName).toBe('ada9000');
      expect(data?.assets[0]?.name).toBe('$ada9000');
      expect(data?.assets[0]?.image).toBe('ipfs://QmaZ56m6ScGyzpYnGdSbp3z6jkMU7UZSuy7Azjnw8gzQMm');
      expect(data?.assets[0]?.other?.website).toBe('https://adahandle.com');
      expect(data?.assets[0]?.other?.name).toBeUndefined();
      expect(data?.assets[0].nftType).toBe(NftTypes.ipfs);
    } else {
      throw new Error('Undefined assset');
    }
  });

  it('CardanoTrees Bonsai 00216', () => {
    const mockedNFT = require('./__mocks__/realWorldNfts/cardanoTreesBonsai00216.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeNull();
    expect(data?.policyId).toBe('4bfa713fc28cdd2d5e2adb518ef1265f715e39ee5af0f7be14bfa8bf');
    expect(data?.assets[0]).toBeDefined();
    expect(data?.assets[0]?.assetName).toBe('CTB00216');
    expect(data?.assets[0]?.other?.name).toBeUndefined();
    expect(data?.assets[0]?.name).toBe('CardanoTrees Bonsai 00216');
    expect(data?.assets[0]?.mediaType).toBe('image/svg+xml');
  });

  it('ClayNation Mint Transaction metadata', () => {
    const mockedNFT = require('./__mocks__/realWorldNfts/clayNationMintTx.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeNull();
    expect(data?.policyId).toBe('40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728');
    expect(data?.assets.length).toBe(30);
    expect(data?.assets[29].assetName).toBe('ClayNation9393');
  });

  it('Hosky', () => {
    const mockedNFT = require('./__mocks__/realWorldNfts/hosky.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeNull();
    expect(data?.policyId).toBe('a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235');
    expect(data?.assets[0].other?.ticker).toBe('HOSKY');
    expect(data?.assets[0].other?.url).toBe('https://hosky.io');
  });
});
