import { version } from 'prettier';
import { Metadata, Asset, MetadataErrors, NftTypes, FileMetadata, MetadataError } from './types/types';
import { validJson, isValidUrl } from './utils/utils';
import {
  validMetadataSize,
  contains721Metadatum,
  findPolicyId,
  findAssets,
  findVersion,
  findExtensions,
} from './metadata/metadata';

export const ParseCNFT = (jsonStr: string): Metadata => {
  const cnft: Metadata = { data: null, error: null };

  // check json is valid
  const { json, error: jsonError } = validJson(jsonStr);
  cnft.error = jsonError;
  if (cnft.error) {
    return cnft;
  }

  // check if json is null, return an error if so
  if (json === null) {
    cnft.error = { type: MetadataErrors.json, message: 'Empty json' };
    return cnft;
  }

  // check metadata is valid size
  cnft.error = validMetadataSize(json); // TODO: test and validate this 16384
  if (cnft.error) {
    return cnft;
  }

  // check 721 tag
  cnft.error = contains721Metadatum(json);
  if (cnft.error) {
    return cnft;
  }

  // check policy
  const { policyId, error: policyError } = findPolicyId(json);
  cnft.error = policyError;
  if (cnft.error) {
    return cnft;
  }

  // if policy is null return
  if (policyId === null) {
    cnft.error = { type: MetadataErrors.cip25, message: 'No policy defined' };
    return cnft;
  }

  // find versions
  const { version, error: versionError } = findVersion(json);
  cnft.error = versionError;
  if (cnft.error) {
    return cnft;
  }

  // find extensions
  const { ext, error: extError } = findExtensions(json);
  cnft.error = extError;
  if (cnft.error) {
    return cnft;
  }

  // find assets
  const { assets, error: assetError } = findAssets(json, policyId, ext);
  cnft.error = assetError;
  if (cnft.error) {
    return cnft;
  }

  // TODO: check all required properties are present

  // TODO: check ext

  // TODO: handle version 2

  // return CNFT
  cnft.data = {
    policyId,
    assets,
    version,
    ext,
  };

  return cnft;
};
