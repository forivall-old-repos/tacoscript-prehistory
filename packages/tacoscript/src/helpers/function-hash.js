// Helper to check if a function that we have completely overridden has changed
// from when it was originally overridden

import createHash from 'create-hash';

export default function functionHash(fn) {
  let hash = createHash('md5');
  hash.update(fn.toString());
  return hash.digest().toString('hex');
}
