import { MetadataError, MetadataErrors } from '../types/types';

// checks if a jsonStr is valid json
/** @internal */
export const validJson = (
  jsonStr: string,
): {
  json: JSON | undefined;
  error: MetadataError | undefined;
} => {
  let json: JSON | undefined = undefined;
  let error: MetadataError | undefined = undefined;
  try {
    json = JSON.parse(jsonStr);
  } catch (e) {
    if (e instanceof SyntaxError) {
      error = { type: MetadataErrors.json, message: e.message };
      return { json, error };
    } else {
      // raise unhandled error
      throw e;
    }
  }
  return { json, error };
};

// check if a url is valid
/** @internal */
export const isValidUrl = (urlString: string): boolean => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};
