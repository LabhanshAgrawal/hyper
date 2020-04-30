// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-return */
const valsCache = new WeakMap();

export function values(imm: Record<string, any>) {
  if (!valsCache.has(imm)) {
    valsCache.set(imm, Object.values(imm));
  }
  return valsCache.get(imm);
}

const keysCache = new WeakMap();
export function keys(imm: Record<string, any>) {
  if (!keysCache.has(imm)) {
    keysCache.set(imm, Object.keys(imm));
  }
  return keysCache.get(imm);
}

export const ObjectTypedKeys = <T>(obj: T) => {
  return Object.keys(obj) as (keyof T)[];
};

export const emptyArrays = (x: any) => {
  if (Array.isArray(x)) {
    while (x.length > 0) {
      x.pop();
    }
  } else if (typeof x === 'object') {
    for (const key in x) {
      if (Object.prototype.hasOwnProperty.call(x, key)) {
        emptyArrays(x[key]);
      }
    }
  }
};
