import {
  Asset,
  FileMetadata,
  MetadataError,
  MetadataErrors,
  NftTypes,
  NftExtensions,
  NftVersions,
  References,
} from '../types/types';
import { isValidUrl } from '../utils/utils';

// checks json object is not larger than the metadata size limit (note disk size can vary due to whitespace)
/** @internal */
export const validMetadataSize = (json: JSON): MetadataError | undefined => {
  const maxTxSize = 16384; // bytes
  const bytes = new TextEncoder().encode(JSON.stringify(json)).length;
  if (bytes > maxTxSize) {
    return { type: MetadataErrors.cip25, message: `Metadata size is '${bytes}' maxTxSize is '${maxTxSize}'` };
  }
  return undefined;
};

// checks json object contains a the 721 tag
/** @internal */
export const contains721Metadatum = (json: JSON): MetadataError | undefined => {
  if (!('721' in json)) {
    return { type: MetadataErrors.cip25, message: 'Missing 721 metadatum tag' };
  }
  return undefined;
};

// find and return the policy ID
/** @internal */
export const findPolicyId = (json: any): { policyId: string | undefined; error: MetadataError | undefined } => {
  let policyId: string | undefined;
  let error: MetadataError | undefined;
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

// find and return version if it exists
/** @internal */
export const findVersion = (json: any): { version: number | undefined; error: MetadataError | undefined } => {
  let version: number | undefined;
  let error: MetadataError | undefined;

  const root721Tags = Object.keys(json[721]);
  // check there is only one policy
  if (root721Tags.includes('version')) {
    if (Object.values(NftVersions).includes(json[721].version)) {
      if (Number.isInteger(json[721].version)) {
        version = json[721].version;
        return { version, error };
      }
    } else {
      error = {
        type: MetadataErrors.cip25,
        message: `version '${json[721].version} is invalid. Known versions '${JSON.stringify(NftVersions)}'`,
      };
      return { version, error };
    }
  }
  return { version, error };
};

// find and return extensions if they exists
/** @internal */
export const findExtensions = (json: any): { ext: [string] | undefined; error: MetadataError | undefined } => {
  let ext: [string] | undefined;
  let error: MetadataError | undefined;
  const root721Tags = Object.keys(json[721]);
  // check there is only one policy
  if (root721Tags.includes('ext')) {
    // check ext is an array
    if (!Array.isArray(json[721].ext)) {
      error = {
        type: MetadataErrors.cip25,
        message: `ext is a string array not ${typeof json[721].ext}'`,
      };
      return { ext, error };
    }
    // check each array element to ensure it's a valid extension
    json[721].ext.forEach((extItem: string) => {
      if (!NftExtensions.includes(extItem)) {
        error = {
          type: MetadataErrors.cip25,
          message: `ext '${extItem}' is a invalid extension. Known extensions '${JSON.stringify(NftExtensions)}'`,
        };
        return { ext, error };
      }
    });
    ext = json[721].ext;
  }
  return { ext, error };
};

const validArrayProperty = (
  errorType: MetadataErrors,
  arrayProp: any,
): {
  error: MetadataError | undefined;
} => {
  let error: MetadataError | undefined;
  if (Array.isArray(arrayProp)) {
    arrayProp.forEach((element: string) => {
      if (element.length > 64) {
        error = {
          type: errorType,
          message: `Array element too large. Expected 64 chars or less got '${element.length}'`,
        };
      }
    });
  } else {
    error = { type: errorType, message: `Expect array got '${typeof { arrayProp }}'` };
    return { error };
  }
  return { error };
};

// experimental CIP48 usage
/** @internal */
export const handleCip48 = (
  refs: References[],
  assetName: string,
  policyId: string,
): {
  references: References[] | undefined;
  error: MetadataError | undefined;
} => {
  const references: References[] = [];
  var error: MetadataError | undefined;

  //const refs = ;
  let foundRefForAsset = false;
  // check each ref is valid
  refs.forEach((ref: References) => {
    if (ref.name === assetName) {
      foundRefForAsset = true;
    }

    // check required properties exist
    if (!ref.mediaType) {
      error = {
        type: MetadataErrors.cip48,
        message: `CIP48 requires mediaType property. Asset '${assetName}' is missing mediaType`,
      };
      return { references, error };
    }
    if (!ref.src) {
      error = {
        type: MetadataErrors.cip48,
        message: `CIP48 requires src property array. Asset '${assetName}' is missing src array`,
      };
      return { references, error };
    }

    // TODO: check valid types if defined
    // set default type to current policy if not defined
    if (!ref.type) {
      ref.type = { policy: policyId };
    }

    const { error: arrayError } = validArrayProperty(MetadataErrors.cip48, ref.src);
    // check valid src array
    if (arrayError) {
      return { references, arrayError };
    }
    references.push(ref);
  });

  if (!foundRefForAsset) {
    error = {
      type: MetadataErrors.cip48,
      message: `No reference name matches the asset name '${assetName}'. 
    Ensure at least one 'refs' property contains a name tag that matches the asset name`,
    };
    return { references, error };
  }
  return { references, error };
};

const parseFilesProperty = (
  files: any[],
): {
  filesOnChain: boolean;
  error: MetadataError | undefined;
} => {
  let filesOnChain = false;
  let error: MetadataError | undefined;

  files.forEach((f: FileMetadata) => {
    if (!('name' in f)) {
      error = { type: MetadataErrors.cip25, message: "It's recommended to include a name tag" };
      return { filesOnChain, error };
    }
    if (!('src' in f)) {
      error = { type: MetadataErrors.cip25, message: 'Files require a src tag' };
      return { filesOnChain, error };
    }
    if (Array.isArray(f.src)) {
      if (!('mediaType' in f)) {
        filesOnChain = true;
        error = { type: MetadataErrors.cip25, message: 'Files require a mediaType (that define mime type)' };
        return { filesOnChain, error };
      }

      const { error: arrayError } = validArrayProperty(MetadataErrors.cip48, f.src);
      if (arrayError) {
        return { filesOnChain, arrayError };
      }
    } else if (!isValidUrl(f.src)) {
      error = { type: MetadataErrors.cip25, message: 'Files src must be a valid url' };
      return { filesOnChain, error };
    }
  });

  return { filesOnChain, error };
};

// finds assets (aka NFTs) within a JSON object given a policyId
export const parseAssets = (
  json: any,
  policyId: string,
  ext: [string] | undefined = undefined,
): { assets: Asset[]; error: MetadataError | undefined } => {
  const assets: Asset[] = [];
  let error: MetadataError | undefined;
  let references: References[] | undefined;

  let usesIpfs: boolean = false;
  let usesChain: boolean = false;
  let usesExternal: boolean = false;

  const assetNames = Object.keys(json[721][policyId]);
  assetNames.forEach((assetName) => {
    // CIP-0048 check
    const usingCip48 = ext?.includes('cip48');

    if (usingCip48 && assetName === 'p') {
      return; // return as p is reserved word and not an asset?
    }

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
    const keysToRemove = ['name', 'image', 'mediaType', 'description', 'files'];

    keysToRemove.forEach((key) => {
      delete other[key];
    });

    // check if image is url? if so set type to image
    const image = json[721][policyId][assetName].image;

    if (Array.isArray(image)) {
      usesChain = true;
      const { error: arrayError } = validArrayProperty(MetadataErrors.cip25, image);
      if (arrayError) {
        return { assets, arrayError };
      }
      // if cant't resolve media type throw error
      if (!('mediaType' in json[721][policyId][assetName])) {
        error = { type: MetadataErrors.cip25, message: 'Image property arrays require a mediaType prop' };
        return { assets, error };
      }
    } else if (isValidUrl(image)) {
      if (image.substr(0, 7) === 'ipfs://') {
        usesIpfs = true;
      } else {
        usesExternal = true;
      }
    } else if (!usingCip48) {
      error = { type: MetadataErrors.cip25, message: 'Invalid image property' };
      return { assets, error };
    }

    // handle cip48
    if (usingCip48) {
      if ('refs' in json[721][policyId][assetName]) {
        const { references: cip48Refs, error: cip48Error } = handleCip48(
          json[721][policyId][assetName].refs,
          assetName,
          policyId,
        );
        if (cip48Error) {
          return { assets, cip48Error };
        }
        usesChain = true;
        references = cip48Refs;
      } else {
        error = {
          type: MetadataErrors.cip48,
          message: `CIP48 requires a refs property for each asset. '${assetName}' is missing refs`,
        };
        return { assets, error };
      }
    }

    // find file type
    if ('files' in json[721][policyId][assetName]) {
      //const files = json[721][policyId][assetName].files;
      const { filesOnChain, error: fileError } = parseFilesProperty(json[721][policyId][assetName].files);
      usesChain = filesOnChain;
      if (fileError) {
        return { assets, fileError };
      }
    }

    // handle type
    let nftType: string = NftTypes.external;
    const usesOffChain = usesExternal || usesIpfs;
    if (usesChain && usesOffChain) {
      nftType = NftTypes.hybrid;
    } else if (usesChain && !usesOffChain) {
      nftType = NftTypes.onchain;
    } else if (usesIpfs) {
      nftType = NftTypes.ipfs;
    }

    // create CNFT_ASSET
    assets.push({
      assetName,
      name: json[721][policyId][assetName].name,
      image,
      mediaType: json[721][policyId][assetName].mediaType,
      description: json[721][policyId][assetName].description,
      files: json[721][policyId][assetName].files,
      other,
      nftType,
      references,
    });
  });
  if (assets.length < 1) {
    error = { type: MetadataErrors.cip25, message: 'No assets defined' };
    return { assets, error };
  }
  return { assets, error };
};
