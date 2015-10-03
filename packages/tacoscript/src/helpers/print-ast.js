import cloneDeep from "lodash/lang/cloneDeep";
import isObject from "lodash/lang/isObject";
import forIn from "lodash/object/forIn";
import forEach from "lodash/collection/forEach";
import isArray from "lodash/lang/isArray";
import omit from "lodash/object/omit";
import mapValues from "lodash/object/mapValues";

export default function printAst(ast) {
  return JSON.stringify(cleanAst(ast), null, "  ");
}

export function cleanAst(origAst) {
  function selectiveCloneDeep(obj) {
    return cloneDeep(obj, function(value) {
      if (isObject(value)) {
        if (!isArray(value)) {
          let omitKeys = ["loc", "start", "end", "tokens", "children", "tokenStart", "tokenEnd"];
          if (value.comments && !value.comments.length) { omitKeys.push("comments"); }
          return mapValues(omit(value, omitKeys), selectiveCloneDeep);
        }
      }
    });
  }
  let ast = selectiveCloneDeep(origAst);
  function recursiveDelete(obj) {
    if (!isObject(obj)) { return; }
    if (isArray(obj)) { forEach(obj, recursiveDelete); return; }
    delete obj.__clone;
    forIn(obj, recursiveDelete);
  }
  recursiveDelete(ast);
  return ast;
}
