import { Asset, FileMetadata, MetadataError, MetadataErrors, NftTypes } from '../types/types';
import { isValidUrl } from '../utils/utils';

// checks json object is not larger than the metadata size limit (note disk size can vary due to whitespace)
/** @internal */
export const validMetadataSize = (json: JSON): MetadataError | null => {
  const maxTxSize = 16384; // bytes
  const bytes = new TextEncoder().encode(JSON.stringify(json)).length;
  if (bytes > maxTxSize) {
    return { type: MetadataErrors.cip25, message: `Metadata size is '${bytes}' maxTxSize is '${maxTxSize}'` };
  }
  return null;
};

// checks json object contains a the 721 tag
/** @internal */
export const contains721Metadatum = (json: JSON): MetadataError | null => {
  if (!('721' in json)) {
    return { type: MetadataErrors.cip25, message: 'Missing 721 metadatum tag' };
  }
  return null;
};

// find and return the policy ID
/** @internal */
export const findPolicyId = (json: any): { policyId: string | null; error: MetadataError | null } => {
  let policyId: string | null = null;
  let error: MetadataError | null = null;
  // filter out other root level properties such as version etc
  const root721Tags = ['version', 'ext'];
  const policyIds = Object.keys(json[721]).filter((item) => !root721Tags.includes(item));
  // check there is only one policy
  if (policyIds.length > 1) {
    error = { type: MetadataErrors.cip25, message: `Multiple policies defined '${JSON.stringify(policyIds)}'` };
    return { policyId, error };
  } else if (policyIds.length < 1) {
    error = { type: MetadataErrors.cip25, message: 'No policy defined' };
    return { policyId, error };
  }
  policyId = policyIds[0];
  return { policyId, error };
};

// finds assets (aka NFTs) within a JSON object given a policyId
/** @internal */
export const findAssets = (json: any, policyId: string): { assets: Asset[]; error: MetadataError | null } => {
  const assets: Asset[] = [];
  let error: MetadataError | null = null;

  const assetNames = Object.keys(json[721][policyId]);
  assetNames.forEach((assetName) => {
    let nftType = NftTypes.offchain;

    // required fields
    if (!('image' in json[721][policyId][assetName])) {
      error = { type: MetadataErrors.cip25, message: 'CIP 25 requires an image tag' };
      return { assets, error };
    }
    if (!('name' in json[721][policyId][assetName])) {
      error = { type: MetadataErrors.cip25, message: 'CIP 25 requires a name tag' };
      return { assets, error };
    }

    // remove keys from other that are defined in CNFT_ASSETS
    const other = JSON.parse(JSON.stringify(json[721][policyId][assetName]));
    const keysToRemove = ['name', 'image', 'mediaType', 'description', 'files'].forEach((key) => {
      delete other[key];
    });

    // check if image is url? if so set type to image
    const image = json[721][policyId][assetName].image;

    if (Array.isArray(image)) {
      // handle on chain
      nftType = NftTypes.onchain;

      // if cant't resolve media type throw error
      image.forEach((str: string) => {
        if (str.length > 64) {
          error = { type: MetadataErrors.cip25, message: 'image array elements must be 64 characters or less' };
          return { assets, error };
        }
      });
    } else if (isValidUrl(image)) {
      if (image.substr(0, 7) === 'ipfs://') {
        nftType = NftTypes.ipfs;
      }
    } else {
      error = { type: MetadataErrors.cip25, message: 'Invalid image url or data' };
      return { assets, error };
    }

    // find file type
    if ('files' in json[721][policyId][assetName]) {
      const files = json[721][policyId][assetName].files;

      files.forEach((f: FileMetadata) => {
        if (!('name' in f)) {
          error = { type: MetadataErrors.cip25, message: "It's recommended to include a name tag" };
          return { assets, error };
        }
        if (!('src' in f)) {
          error = { type: MetadataErrors.cip25, message: 'Files require a src tag' };
          return { assets, error };
        }
        if (Array.isArray(f.src)) {
          if (!('mediaType' in f)) {
            error = { type: MetadataErrors.cip25, message: 'Files require a mediaType (that define mime type)' };
            return { assets, error };
          }
        } else if (!isValidUrl(f.src)) {
          error = { type: MetadataErrors.cip25, message: 'Files src must be a valid url' };
          return { assets, error };
        }
      });
    }

    // create CNFT_ASSET
    assets.push({
      assetName,
      name: 'name' in json[721][policyId][assetName] ? json[721][policyId][assetName].name : null,
      image,
      mediaType: 'mediaType' in json[721][policyId][assetName] ? json[721][policyId][assetName].mediaType : null,
      description: 'description' in json[721][policyId][assetName] ? json[721][policyId][assetName].description : null,
      files: 'files' in json[721][policyId][assetName] ? json[721][policyId][assetName].files : null,
      other,
      nftType: NftTypes.ipfs, // TODO
    });
  });
  if (assets.length < 1) {
    error = { type: MetadataErrors.cip25, message: 'No assets defined' };
    return { assets, error };
  }
  return { assets, error };
};
