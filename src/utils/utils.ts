import { MetadataError, MetadataErrors } from '../types/types';

// checks if a jsonStr is valid json
/** @internal */
export const validJson = (
  jsonStr: string,
): {
  json: JSON | null;
  error: MetadataError | null;
} => {
  let json: JSON | null = null;
  let error: MetadataError | null = null;
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
