import { version } from "prettier"

export type CNFT = {
    data: CNFT_DATA | null
    error: CNFT_ERROR | null
    warnings: [string] | null
}

export type CNFT_DATA = {
    policyId: string //TODO
    assets?: Array<CNFT_ASSETS>
    version?: nftVersion
}

export type CNFT_ASSETS = {
    assetName: string //TODO
    name?:string
    image?: string | [string]
    mediaType?: string
    description?: string
    files?: [CNFT_FILE]
    other?: any
    onchain: boolean
}

export type CNFT_FILE = {
    name: string
    mediaType: string
    src: string | [string]
    other?: any
}

enum nftVersion {
    version2 = 2,
}

export type CNFT_ERROR = {
    type: CNFT_ERROR_TYPES
    message: string
}

export enum CNFT_ERROR_TYPES {
    json = "json",
    cip25 = "cip25"
}

export enum CNFT_CIP25_ERRROR {

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

function validMetadataSize(json:JSON, cnft:CNFT){
    const size = new TextEncoder().encode(JSON.stringify(json)).length
    const kB = size / 1024;
    if (kB > 16){ //TODO: use actual value
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message:'Metadata too large over 16kB'}
    }
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
        // remove keys from other that are defined in CNFT_ASSETS
        let other = JSON.parse(JSON.stringify(json[721][policyId][assetName]));
        let keysToRemove = ["name", 'image', 'mediaType', 'description', 'files'].forEach((key) => {
            console.log(key)
            delete other[key]
        })
        // create CNFT_ASSET
        assets.push(
            {
                assetName: assetName,
                name: 'name' in json[721][policyId][assetName] ?  json[721][policyId][assetName]['name'] : null,
                image: 'image' in json[721][policyId][assetName] ?  json[721][policyId][assetName]['image'] : null,
                mediaType: 'mediaType' in json[721][policyId][assetName] ?  json[721][policyId][assetName]['mediaType'] : null,
                description: 'description' in json[721][policyId][assetName] ?  json[721][policyId][assetName]['description'] : null,
                files: 'files' in json[721][policyId][assetName] ?  json[721][policyId][assetName]['files'] : null,
                other: other,
                onchain: false //TODO
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

    validMetadataSize(json, cnft) // TODO: test and validate this
    if(cnft.error) { return cnft }

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
    // if version 2 handle version 2...

    // TODO: handle CIP 48

    // return CNFT
    cnft.data = {
        policyId: policyId,
        assets: assets
    }

    return cnft;
};

