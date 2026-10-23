// Public content cache lives only for this page session, never in browser storage.
const entries = new Map();
export const memoryCache = {
  getItem: key => entries.get(key) ?? null,
  setItem: (key, value) => entries.set(key, String(value)),
  removeItem: key => entries.delete(key),
};
