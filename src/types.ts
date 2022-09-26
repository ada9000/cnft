export type Metadata = {
  data: Data | null;
  error: MetadataError | null;
};

export type Data = {
  policyId: string; // TODO
  assets: Asset[];
  version?: NftVersions;
};

export type Asset = {
  assetName: string; // TODO
  name: string;
  image: string | [string];
  mediaType?: string;
  description?: string;
  files?: [FileMetadata];
  other?: any;
  nftType: NftTypes;
};

export type FileMetadata = {
  name?: string;
  mediaType: string;
  src: string | [string];
  other?: any;
};

export enum NftTypes {
  onchain = 'on-chain',
  offchain = 'off-chain',
  ipfs = 'ipfs',
  hybrid = 'hybrid',
}

enum NftVersions {
  version2 = 2,
}

export type MetadataError = {
  type: MetadataErrors;
  message: string;
};

export enum MetadataErrors {
  json = 'json',
  cip25 = 'cip25',
}
