import { abytes } from '@noble/hashes/utils';

function bool(value) {
  if (typeof value !== 'boolean') {
    throw new Error(`boolean expected, got ${typeof value}`);
  }
}

function bytes(value, ...lengths) {
  abytes(value, ...lengths);
}

const assertCompat = {
  bool,
  bytes,
};

export { bool, bytes };
export default assertCompat;
