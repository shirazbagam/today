/**
 * DEPRECATED: This file is kept for backward compatibility only.
 * All imports should use api-secure.ts instead
 */

// Re-export everything from the secure API module
export {
  getApiBase,
  getToken,
  setToken,
  removeAdminToken,
  uploadAdminImage,
  fetcher,
  fetcherPublic
} from "./api-secure";
