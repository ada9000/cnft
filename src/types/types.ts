// Metadata
export type Metadata = {
  data: Data | null;
  error: MetadataError | null;
};

// Metadata data
export type Data = {
  policyId: string;
  assets: Asset[];
  version?: NftVersions;
  ext?: [string]; //TODO: based on CIP 49 - which is a work in progress
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
  references?: References;
};

// on-chain reference
export type References = {
  type: 'policy' | 'txhash';
  target: string;
  src: [string];
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
enum NftVersions {
  v2 = 2,
}

// Metadata Error, returned on error contains a error type and a descriptive message
export type MetadataError = {
  type: MetadataErrors;
  message: string;
};

// Types of metadata errors
export enum MetadataErrors {
  json = 'json',
  cip25 = 'cip25',
}
