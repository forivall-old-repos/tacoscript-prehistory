import escapeRegExp from "lodash/string/escapeRegExp";
import startsWith from "lodash/string/startsWith";
import isBoolean from "lodash/lang/isBoolean";
import minimatch from "minimatch";
import isString from "lodash/lang/isString";
import isRegExp from "lodash/lang/isRegExp";
import slash from "slash";

export { inherits, inspect } from "util";

/**
 * Create an array from any value, splitting strings by ",".
 * Borrowed from Babel.
 * TODO: unify with arrayify
 * TODO: move into separate repo
 */

export function list(val?: string): Array<string> {
  if (!val) {
    return [];
  } else if (Array.isArray(val)) {
    return val;
  } else if (typeof val === "string") {
    return val.split(",");
  } else {
    return [val];
  }
}

/**
 * Create a RegExp from a string, array, or regexp.
 */

export function regexify(val: any): RegExp {
  if (!val) return new RegExp(/.^/);

  if (Array.isArray(val)) val = new RegExp(val.map(escapeRegExp).join("|"), "i");

  if (isString(val)) {
    // normalise path separators
    val = slash(val);

    // remove starting wildcards or relative separator if present
    if (startsWith(val, "./") || startsWith(val, "*/")) val = val.slice(2);
    if (startsWith(val, "**/")) val = val.slice(3);

    var regex = minimatch.makeRe(val, { nocase: true });
    return new RegExp(regex.source.slice(1, -1), "i");
  }

  if (isRegExp(val)) return val;

  throw new TypeError("illegal type for regexify");
}

/**
 * Create an array from a boolean, string, or array, mapped by and optional function.
 */

export function arrayify(val: any, mapFn?: Function): Array {
  if (!val) return [];
  if (isBoolean(val)) return arrayify([val], mapFn);
  if (isString(val)) return arrayify(list(val), mapFn);

  if (Array.isArray(val)) {
    if (mapFn) val = val.map(mapFn);
    return val;
  }

  return [val];
}

/**
 * Makes boolean-like strings into booleans.
 */

export function booleanify(val: any): boolean {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}
