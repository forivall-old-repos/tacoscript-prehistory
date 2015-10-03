import * as t from "../../types";
import { types as tt } from "horchata/lib/tokenizer/types";
import { wb, sp, tab, nl } from "../token/types";

/**
 * Prints nodes with params, prints typeParameters, params, and returnType, handles optional params.
 */

export function _params(node) {
  this.print(node.typeParameters, node);
  this.push("(");
  this.printList(node.params, node, {
    iterator: (node) =>{
      if (node.optional) this.push("?");
      this.print(node.typeAnnotation, node);
    }
  });
  this.push(")");

  if (node.returnType) {
    this.print(node.returnType, node);
  }
}

/**
 * Prints method-like nodes, prints key, value, and body, handles async, generator, computed, and get or set.
 */

export function _method(node) {
  var value = node.value;
  var kind  = node.kind;
  var key   = node.key;

  if (kind === "method" || kind === "init") {
    if (value.generator) {
      this.push("*");
    }
  }

  if (kind === "get" || kind === "set") {
    this.push(kind, " ");
  }

  if (value.async) this.push("async");

  if (node.computed) {
    this.push("[");
    this.print(key, node);
    this.push("]");
  } else {
    this.print(key, node);
  }

  this._params(value);
  this.space();
  this.print(value.body, node);
}

/**
 * Prints FunctionExpression, prints id and body, handles async and generator.
 */

export function FunctionExpression(node, parent) {
  if (node.id) {
    this.push("function");
    this.print(node.id, node);
  }
  this._finishFunction(node, parent);
}

/**
 * Prints FunctionDeclaration, prints id and body, handles async and generator.
 */

export function FunctionDeclaration(node, parent) {
  this.push("function");
  if (node.id) {
    this.print(node.id, node);
  } else {
    this.space();
  }
  this._finishFunction(node, parent);
}

export function _finishFunction(node, parent) {
  this._params(node);
  this.space();
  if (node.generator) this.push("*");
  if (node.async) {
    this.push(tt.asyncArrow);
  } else {
    this.push(tt.unboundArrow);
  }
  this.print(node.body, node);
}

/**
 * Prints ArrowFunctionExpression, prints params and body, handles async.
 * Leaves out parentheses when single param.
 */

export function ArrowFunctionExpression(node, parent) {
  if (node.async) this.push("async");

  if (node.params.length === 1 && t.isIdentifier(node.params[0])) {
    this.print(node.params[0], node);
  } else {
    this._params(node);
  }

  this.push("=>");

  const bodyNeedsParens = t.isObjectExpression(node.body);

  if (bodyNeedsParens) {
    this.push("(");
  }

  this.print(node.body, node);

  if (bodyNeedsParens) {
    this.push(")");
  }
}
