import * as t from "../../types";
import { types as tt } from "horchata/lib/tokenizer/types";
import { Token } from "horchata/lib/tokenizer";
import { wb, sp, fsp, tab, nl } from "../token/types";

/**
 * Prints WithStatement, prints object and body.
 */

export function WithStatement(node) {
  this.keyword("with");
  this.print(node.object, node);
  this.printBlock(node.body, node);
}

/**
 * Prints IfStatement, prints test, consequent, and alternate.
 */

export function IfStatement(node, parent) {
  this.keyword("if");
  this.space();
  this.print(node.test, node);
  // this.terminateLine();

  // TODO: move these functions to before and after functions in the call to print,
  // and evenually handle this with a transform.
  let consequentIsBlock = node.consequent.type === 'BlockStatement';
  if (!consequentIsBlock) {
    this.push(sp, new Token({type: tt._then, value: 'then'}), sp);
    // this.terminateLine();
    // this.indent();
  }
  this.print(node.consequent, node);
  if (!consequentIsBlock) {
    // this.dedent();
  }


  if (node.alternate) {
    this.push("else");
    // if only element of alternate is an ifstatement, don't indent.
    if (node.alternate.type !== 'BlockStatement') {
      this.push(sp);
    }
    this.print(node.alternate, node);
  }
}

/**
 * Prints ForStatement, prints init, test, update, and body.
 */

export function ForStatement(node) {
  this.keyword("for");
  this.space();
  this.print(node.init, node);

  if (node.test) {
    this.space();
    this.keyword("while");
    this.space();
    this.print(node.test, node);
  }

  if (node.update) {
    this.space();
    this.keyword("update");
    this.space();
    this.print(node.update, node);
  }

  this.printBlock(node.body, node);
}

/**
 * Prints WhileStatement, prints test and body.
 */

export function WhileStatement(node) {
  this.keyword("while");
  this.push("(");
  this.print(node.test, node);
  this.push(")");
  this.printBlock(node.body, node);
}

/**
 * Builds ForIn or ForOf statement printers.
 * Prints left, right, and body.
 */

var buildForXStatement = function (op) {
  return function (node) {
    this.keyword("for");
    this.space();
    this.print(node.left, node);
    this.space();
    this.push(op);
    this.space();
    this.print(node.right, node);
    this.space();
    this.printBlock(node.body, node);
  };
};

/**
 * Create ForInStatement and ForOfStatement printers.
 */

export var ForInStatement = buildForXStatement("in");
export var ForOfStatement = buildForXStatement("of");

/**
 * Prints DoWhileStatement, prints body and test.
 */

export function DoWhileStatement(node) {
  this.push("do", " ");
  this.print(node.body, node);
  this.space();
  this.keyword("while");
  this.push("(");
  this.print(node.test, node);
  this.push(")", ";");
}

/**
 * Builds continue, return, or break statement printers.
 * Prints label (or key).
 */

var buildLabelStatement = function (prefix, key = "label") {
  return function (node) {
    this.push(prefix);

    var label = node[key];
    if (label) {
      this.push(" ");
      var terminatorState = this.startTerminatorless();
      this.print(label, node);
      this.endTerminatorless(terminatorState);
    }

    this.terminateLine();
  };
};

/**
 * Create ContinueStatement, ReturnStatement, and BreakStatement printers.
 */

export var ContinueStatement = buildLabelStatement("continue");
export var ReturnStatement   = buildLabelStatement("return", "argument");
export var BreakStatement    = buildLabelStatement("break");
export var ThrowStatement    = buildLabelStatement("throw", "argument");

/**
 * Prints LabeledStatement, prints label and body.
 */

export function LabeledStatement(node) {
  this.print(node.label, node);
  this.push(":", " ");
  this.print(node.body, node);
}

/**
 * Prints TryStatement, prints block, handlers, and finalizer.
 */

export function TryStatement(node) {
  this.keyword("try");
  this.print(node.block, node);
  this.space();

  // Esprima bug puts the catch clause in a `handlers` array.
  // see https://code.google.com/p/esprima/issues/detail?id=433
  // We run into this from regenerator generated ast.
  if (node.handlers) {
    this.print(node.handlers[0], node);
  } else {
    this.print(node.handler, node);
  }

  if (node.finalizer) {
    this.space();
    this.push("finally", " ");
    this.print(node.finalizer, node);
  }
}

/**
 * Prints CatchClause, prints param and body.
 */

export function CatchClause(node) {
  this.keyword("catch");
  this.push("(");
  this.print(node.param, node);
  this.push(")", " ");
  this.print(node.body, node);
}

/**
 * Prints SwitchStatement, prints discriminant and cases.
 */

export function SwitchStatement(node) {
  this.keyword("switch");
  this.push("(");
  this.print(node.discriminant, node);
  this.push(")");
  this.space();
  this.push("{");

  this.printSequence(node.cases, node, {
    indent: true,
    addNewlines(leading, cas) {
      if (!leading && node.cases[node.cases.length - 1] === cas) return -1;
    }
  });

  this.push("}");
}

/**
 * Prints SwitchCase, prints test and consequent.
 */

export function SwitchCase(node) {
  if (node.test) {
    this.push("case", " ");
    this.print(node.test, node);
    this.push(":");
  } else {
    this.push("default", ":");
  }

  if (node.consequent.length) {
    this.newline();
    this.printSequence(node.consequent, node, { indent: true });
  }
}

/**
 * Prints DebuggerStatement.
 */

export function DebuggerStatement() {
  this.push("debugger", nl);
}

/**
 * Prints VariableDeclaration, prints declarations, handles kind and format.
 */

export function VariableDeclaration(node, parent) {
  this.push(node.kind, sp);

  var sep = [tt.comma, sp];
  // sep = `,\n${repeating(" ", node.kind.length + 1)}`;

  this.printList(node.declarations, node, { separator: sep });

  if (t.isFor(parent)) {
    // don't give semicolons to these nodes since they'll be inserted in the parent generator
    if (parent.left === node || parent.init === node) return;
  }

  this.terminateLine();
}

/**
 * Prints VariableDeclarator, handles id, id.typeAnnotation, and init.
 */

export function VariableDeclarator(node) {
  this.print(node.id, node);
  this.print(node.id.typeAnnotation, node);
  if (node.init) {
    this.space();
    this.push("=");
    this.space();
    this.print(node.init, node);
  }
}
