// Compatibility shim for @noble/hashes/_assert.
// Inlines the needed helpers so the file has zero imports, which lets
// both webpack and turbopack resolve it from the project root.

function isBytes(a) {
  return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}

function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error('Uint8Array expected');
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error('Uint8Array expected of length ' + lengths + ', got length=' + b.length);
}

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
