// Metadata
export type Metadata = {
  data: Data | undefined;
  error: MetadataError | undefined;
};

// Metadata data
export type Data = {
  policyId: string;
  assets: Asset[];
  version?: number;
  ext?: [string]; // TODO: based on CIP 49 - which is a work in progress
};

// Assets - Each asset is an NFT
export type Asset = {
  assetName: string;
  name: string;
  image: string | [string];
  mediaType?: string;
  description?: string;
  files?: [FileMetadata];
  other?: any;
  nftType: NftTypes;
  references?: References[];
};

// on-chain reference
export type References = {
  // core ref types
  name: string;
  mediaType: string;
  src: [string];
  // utility to help find payloads
  type: { policy: string } | { txhash: [string] };
};

// File metadata - used to define more detailed files
export type FileMetadata = {
  name?: string;
  mediaType: string;
  src: string | [string];
  other?: any;
};

// The different types of nft data
export enum NftTypes {
  onchain = 'on-chain', // data is stored on chain
  offchain = 'off-chain', // data is found at a url
  ipfs = 'ipfs', // uses inter planetary file storage (IPFS)
  immutable = 'ipfs', // uses some other immutable file storage
  hybrid = 'hybrid', // ipfs and onchain
}

// nft versions currently we have version 1 which is default and version 2
export const NftVersions = [2];
export const NftExtensions = ['cip48'];

// Metadata Error, returned on error contains a error type and a descriptive message
export type MetadataError = {
  type: MetadataErrors;
  message: string;
};

// Types of metadata errors
export enum MetadataErrors {
  json = 'json',
  cip25 = 'cip25',
  cip48 = 'cip48',
}
