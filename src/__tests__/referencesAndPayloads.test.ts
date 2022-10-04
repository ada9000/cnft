import { ParseCNFT } from '../index';
import { MetadataErrors, NftExtensions, NftTypes } from '../types/types';

describe('References and payloads', () => {
  it('Simple ref test', () => {
    const mockedNFT = require('./__mocks__/referencesAndPayloads/ext48.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeUndefined();
    if (!data?.ext) throw new Error('ext should be defined');
    if (!data.assets[0].references) throw new Error('refs should be defined');
    // check contains cip48 and the correct reference type
    expect(data.ext[0]).toBe('cip48');
    expect(JSON.stringify(data.assets[0].references[0].type)).toBe(
      JSON.stringify({ policy: '00000000000000000000000000000000000000000000000000000000' }),
    );
  });

  it('Metadata with 3 reference is correct', () => {
    const mockedNFT = require('./__mocks__/referencesAndPayloads/mutipleAssets.json');
    const { data, error } = ParseCNFT(JSON.stringify(mockedNFT));
    expect(error).toBeUndefined();
    if (!data?.ext) throw new Error('ext should be defined');
    if (!data.assets[0].references) throw new Error('refs should be defined');
    if (!data.assets[1].references) throw new Error('refs should be defined');
    if (!data.assets[2].references) throw new Error('refs should be defined');
    expect(data.ext[0]).toBe('cip48');
    expect(data.assets[0].name).toBe('RedCircle');
    expect(data.assets[0].references[0].name).toBe('RedCircle');
    expect(JSON.stringify(data.assets[0].references[0].src)).toBe(JSON.stringify(['r0', 'r1', 'r2', 'r', 'r3']));
    expect(data.assets[1].name).toBe('GreenCircle');
    expect(data.assets[1].references[0].name).toBe('GreenCircle');
    expect(JSON.stringify(data.assets[1].references[0].src)).toBe(JSON.stringify(['r0', 'r1', 'r2', 'g', 'r3']));
    expect(data.assets[2].name).toBe('BlueCircle');
    expect(data.assets[2].references[0].name).toBe('BlueCircle');
    expect(JSON.stringify(data.assets[2].references[0].src)).toBe(JSON.stringify(['r0', 'r1', 'r2', 'b', 'r3']));
  });
});

describe('References and payloads errors', () => {
  it('Metadata with 3 reference is correct', () => {
    expect(true).toBeTruthy(); //TODO
  });
});
