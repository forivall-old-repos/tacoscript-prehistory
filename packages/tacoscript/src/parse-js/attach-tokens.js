// TODO: separate out the comment token creation

import {Token} from "babylon/lib/tokenize";

import traverse from 'babel-core/lib/traversal';
import * as types from 'babel-core/lib/types';

import flatten from "lodash/array/flatten";
import compact from "lodash/array/compact";
import includes from "lodash/collection/includes";

export default function attachTokens(ast, code, options={}) {
  var tokens = ast.tokens;
  if (options.whitespace) {
    tokens = ast.whitespaceTokens = createWhitespaceTokens(ast, code);
  }
  // TODO: hand write this function instead of using traverse() ; or, write
  // a custom version of traverse
  // traverse ast; attach tokens accordingly; make sure it's performed with performance in mind
  var i = 0, cur = tokens[i];
  function next() { return tokens[i += 1]; }
  var stack = [];
  var pushPop = true;
  function pushCurToken() {
    for (var si = 0, l = stack.length; si < l; si++) {
      stack[si].tokens.push(cur);
    }
    // (stack[stack.length - 1] || ast)[pushPop ? "tokensLeading" : "tokensTrailing"].push(cur);
  }
  // ast.tokensLeading = [];
  // ast.tokensTrailing = [];
  traverse(ast, {
    noScope: true,
    enter: function(node, parent, scope, nodes) {
      for (; cur.start < node.start; cur = next()) {
        pushCurToken();
      }
      node.tokens = [];
      // node.tokensLeading = [];
      // node.tokensTrailing = [];
      node.firstTokenIndex = i;
      stack.push(node); pushPop = true;
      // console.log(node.start, stack.length);

      let visitors = types.VISITOR_KEYS[node.type];
      let childNodes = compact(flatten(visitors.map((v) => node[v])));
      node.children = childNodes;
    }
    ,
    exit: function(node) {
      for (; cur && cur.end <= node.end; cur = next()) {
        pushCurToken();
      }
      /*var popped = */stack.pop(); pushPop = false;
      node.lastTokenIndex = i;
      // assert(popped === node);
      // console.log(node.end, stack.length, popped === node);

      // let childNodes = node.children;
      // if (!childNodes || !childNodes.length) { return; }
      // let childNode, childNodeBefore, childNodeAfter, childNodeIndex = -1;
      // function nextChild() {
      //   childNodeIndex++;
      //   childNodeBefore = childNodes[childNodeIndex - 1];
      //   childNode = childNodes[childNodeIndex];
      //   childNodeAfter = childNodes[childNodeIndex + 1];
      // }
      // nextChild();
      // for (let token of (node.tokens: Array)) {
      //
      //   if ((!childNodeBefore || token.start >= childNodeBefore.end) && token.end <= childNode.start) {
      //     (childNode.tokensBefore || (childNode.tokensBefore = [])).push(token);
      //   } else if (includes(childNode.tokens, token)) {
      //
      //   } else if (token.start >= childNode.end && (!childNodeAfter || token.end <= childNodeAfter.start)) {
      //     // TODO: create rules to go to the nextchild ; lookahead, etc.
      //     (childNode.tokensAfter || (childNode.tokensAfter = [])).push(token);
      //   } else {
      //     nextChild();
      //   }
      // }
    }
  });
  return ast;
}

export function createWhitespaceTokens(ast, code) {
  var tokens = [];
  var state = {
    type: 'Whitespace',
    value: '',
    start: 0,
    end: 0,
    // TODO: read from options; generate locations
    options: {locations: false, ranges: true}
  };
  var cur, prev = {end: 0};
  for (var i = 0, l = ast.tokens.length; i <= l; i++) {
    cur = ast.tokens[i] || {start: l};
    if (cur.start > prev.end) {
      state.start = prev.end;
      state.end = cur.start;
      state.value = code.slice(state.start, state.end);
      tokens.push(new Token(state));
    }
    tokens.push(cur);
    prev = cur;
  }
  tokens.pop(); // pop off dummy last token
  return tokens;
}
