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



export const ParseCNFT = (jsonStr: string) : CNFT => {
    const cnft:CNFT = {data:null, error:null, warnings: null};
    
    var json = null
    // check json
    try {
        json = JSON.parse(jsonStr)
        console.log(json)
    } catch (e) {
        if(e instanceof SyntaxError){
            cnft.error = {type:CNFT_ERROR_TYPES.json, message:e.message}
        } else {
            throw e
        }
    }
    if(json === null){
        return cnft;
    }

    // TODO: check size...
    if(false){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "Max nft size ~16kb"}
        return cnft
    }

    // check 721 tag
    if(!('721' in json)){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "Missing 721 metadatum tag"}
        return cnft
    }

    // check policy
    const policyIds = Object.keys(json[721])
    if(policyIds.length > 1) {
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "Multiple policies defined"}
        return cnft;
    } else if (policyIds.length !== 1){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "No policy defined"}
        return cnft;
    }
    const policyId = policyIds[0]
    
    // check asssets
    const assets:Array<CNFT_ASSETS> = []
    for (const assetName in json[721][policyId]){
        console.log(`adding asset ${assetName}`)
        console.log(`with ${json[721][policyId][assetName]}`)

        assets.push(
            {
                assetName: assetName,
                //TODO other assset properties
                other: json[721][policyId][assetName]
            }
        )
    }
    if(assets.length < 1){
        cnft.error = {type:CNFT_ERROR_TYPES.cip25, message: "No assets defined"}
        return cnft;
    }

    // return CNFT
    cnft.data = {
        policyId: policyId,
        assets: assets
    }

    console.log(cnft)
    console.log(cnft.data.assets)
    return cnft;
};

