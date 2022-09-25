import { version } from "prettier"

export type CNFT = {
    data: CNFT_DATA | null
    error: CNFT_ERROR | null
    warnings: [string] | null
}

export type CNFT_DATA = {
    policyId: string //TODO
    assets?: Array<CNFT_ASSETS>
}

export type CNFT_ASSETS = {
    assetName: string //TODO
    name?:string
    image?: string | [string]
    mediaType?: string //TODO: set all mime types and test
    description?: string
    files?: [any] //TODO
    version?: nftVersion
    other?: any
}

enum nftVersion {
    version2 = 2,
    version3 = 3
}

export type CNFT_ERROR = {
    type: CNFT_ERROR_TYPES
    message: string
}

export enum CNFT_ERROR_TYPES {
    json = "json",
    cip25 = "cip25"
}

function validJson(jsonStr: string, cnft:CNFT){
    var json = null
    try {
        json = JSON.parse(jsonStr)
    } catch (e) {
        if(e instanceof SyntaxError){
            cnft.error = {type:CNFT_ERROR_TYPES.json, message:e.message}
        } else {
            throw e
        }
    }
    if(json === null){
        cnft.error = {type:CNFT_ERROR_TYPES.json, message:'Empty json'}
    }
    return json
}

function contains721Metadatum(json:JSON, cnft:CNFT){
    if(!('721' in json)){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "Missing 721 metadatum tag"}
    }
}

function findPolicyId(json:any, cnft:CNFT){
    const policyIds = Object.keys(json[721])
    if(policyIds.length > 1) {
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "Multiple policies defined"}
    } else if (policyIds.length < 1){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "No policy defined"}
    } 
    return policyIds[0] 
}

function findAssets(json:any, policyId:string, cnft:CNFT){
    const assets:Array<CNFT_ASSETS> = []
    for (const assetName in json[721][policyId]){
        assets.push(
            {
                assetName: assetName,
                //TODO other assset properties
                other: json[721][policyId][assetName] // TODO: subtract already used properties
            }
        )
    }
    if(assets.length < 1){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "No assets defined"}
    }
    return assets
}

export const ParseCNFT = (jsonStr: string) : CNFT => {
    const cnft:CNFT = {data:null, error:null, warnings: null};
    
    const json = validJson(jsonStr, cnft)
    if(cnft.error) { return cnft }

    // TODO: check size...
    if(false){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "Max nft size ~16kb"}
        return cnft
    }

    // check 721 tag
    contains721Metadatum(json, cnft);
    if(cnft.error) { return cnft }
    

    // check policy
    const policyId = findPolicyId(json, cnft)
    if(cnft.error) { return cnft }
        
    // check asssets
    const assets = findAssets(json, policyId, cnft)
    if(cnft.error) { return cnft }

    // check version?? TODO:

    // if version 1 handle version 1...

    // else if version 2 handle version 2...

    // return CNFT
    cnft.data = {
        policyId: policyId,
        assets: assets
    }

    return cnft;
};

