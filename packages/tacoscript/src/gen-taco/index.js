import repeating from "repeating";
import detectIndent from "detect-indent";
import TokenBuffer from "./token/buffer";
import extend from "lodash/object/extend";
import each from "lodash/collection/each";
import n from "./node";
import * as t from "../types";
import { types as tt } from "horchata/lib/tokenizer/types";
import { wb, sp, fsp, tab, nl } from "./token/types";
import { Token } from "horchata/lib/tokenizer";

import isArray from "lodash/lang/isArray";
import includes from "lodash/collection/includes";

/**
 * Tacoscript's code generator, turns an ast into tacoscript code
 */

class CodeGenerator {
  constructor(ast, opts, code) {
    opts = opts || {};
    if (!opts.indent) {
      opts.indent = CodeGenerator.detectIndent(code);
    }

    this._code = code;
    this.comments = ast.comments || [];
    this.tokens   = ast.tokens || [];
    this.opts     = opts;
    this.ast      = ast;
    this.directives = [];

    this._index = 0;
    this.buffer     = new TokenBuffer(this.position, code);
  }

  /**
   * All node generators.
   */

  static generators = {
    templateLiterals: require("./generators/template-literals"),
    comprehensions:   require("./generators/comprehensions"),
    expressions:      require("./generators/expressions"),
    statements:       require("./generators/statements"),
    classes:          require("./generators/classes"),
    methods:          require("./generators/methods"),
    modules:          require("./generators/modules"),
    types:            require("./generators/types"),
    flow:             require("./generators/flow"),
    base:             require("./generators/base"),
    jsx:              require("./generators/jsx")
  };

  static detectIndent(code) {
    let indent = detectIndent(code);
    if (!indent.type || indent.amount === 1 && indent.type === 'space') {
      indent = {amount: 2, type: 'space', indent: '  '};
    }
    return indent;
  }

  /**
   * Generate code and formatting directives from ast. Also returns tokenization
   * of tacoscript code.
   *
   * Appends comments that weren't attached to any node to the end of the generated output.
   */

  generate() {
    var ast = this.ast;

    this.print(ast);
    this.catchUp();

    return {
      code: this.buffer.get(this.opts),
      tokens: this.buffer.tokens,
      directives: this.directives
    };
  }

  /**
   * Catch up to this node's first token if we're behind
   */

  catchUp(node) {
    this._catchUp(node == null ? this.tokens.length : node.tokenStart);
  }
  _catchUp(stop) {
    // catch up to this nodes first token if we're behind
    for (let i = this._index; i < stop; i++) {
      let token = this.tokens[i];
      // TODO: also catchup 'Whitespace', and handle indentation etc. appropriately
      if (token.type === 'CommentBlock') {
        this._push(tt.blockCommentStart);
        this._push(new Token({type: tt.commentBody, value: token.value}));
        this._push(tt.blockCommentEnd);
        this._push(nl);
      } else if (token.type === 'CommentLine') {
        let raw = this._code.slice(token.start, token.end);
        if (raw.startsWith('<!--')) {
          this._push(token);
        } else {
          this._push(tt.lineCommentStart);
          this._push(new Token({type: tt.commentBody, value: token.value}));
        }
        this._push(nl);
      }
    }
    this._index = stop;
  }

  finishBlock(node, parent, options={}) {
    // catch up to this nodes first token if we're behind
    let { indent } = options;
    // TODO: move to printSequence part of block to avoid redoing indent
    if (indent) { this.indent(); }
    this._catchUp(node.tokenEnd);
    if (indent) { this.dedent(); }
  }

  /**
   * Print (Tokenize) a plain node.
   */

  print(node, parent, opts = {}) {
    if (!node) return;

    if (!this[node.type]) {
      throw new ReferenceError(`unknown node of type ${JSON.stringify(node.type)} with constructor ${JSON.stringify(node && node.constructor.name)}`);
    }

    var generateParens = n.generateParens(node, parent);
    for (let i = generateParens; i > 0; i--) { this.push("("); }

    this.catchUp(node);

    // this.printLeadingTokens(node, parent);

    if (opts.before) { opts.before(); }

    this[node.type](node, parent);

    for (let i = generateParens; i > 0; i--) { this.push(")"); }

    if (opts.after) opts.after();

    if (opts.statement) this.terminateLine();
    // this.printTrailingTokens(node, parent);
  }

  /**
   * Print a sequence of nodes as statements.
   */

  printJoin(nodes, parent, opts = {}) {
    if (!nodes || !nodes.length) return;

    var len = nodes.length;

    if (opts.indent) this.indent();

    var separatorIsArray = isArray(opts.separator);

    var printOpts = {
      statement: opts.statement,
      addNewlines: opts.addNewlines,
      after: () => {
        if (opts.iterator) {
          opts.iterator(node, i);
        }

        if (opts.separator && i < len - 1) {
          if (separatorIsArray) {
            this.push(...opts.separator);
          } else {
            this.push(opts.separator);
          }
        }
      }
    };

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      this.print(node, parent, printOpts);
    }

    if (opts.indent) this.dedent();
  }

  /**
   * Print a sequence of nodes as expressions.
   */

  printSequence(nodes, parent, opts = {}) {
    opts.statement = true;
    return this.printJoin(nodes, parent, opts);
  }

  /**
   * Print a list of nodes, with a customizable separator (defaults to ",").
   */

  printList(items, parent, opts = {}) {
    if (opts.separator == null) {
      opts.separator = [tt.comma, sp];
    }

    return this.printJoin(items, parent, opts);
  }

  /**
   * Print a single node as a block
   */

  printBlock(node, parent) {
    let isBlock = t.isBlockStatement(node);
    if (!isBlock) this.indent();
    if (t.isEmptyStatement(node)) {
      this.newline();
      this.keyword('pass');
      this.newline();
    } else {
      this.print(node, parent);
    }
    if (!isBlock) this.dedent();
  }
}

/**
 * Mixin all buffer functions so that they can be directly called on the
 * CodeGenerator instance
 */

each(TokenBuffer.prototype, function (fn, key) {
  CodeGenerator.prototype[key] = function () {
    return fn.apply(this.buffer, arguments);
  };
});

/**
 * Mixin the generator function for each node type
 */

each(CodeGenerator.generators, function (generator) {
  extend(CodeGenerator.prototype, generator);
});

/**
 * API function to generate code, without dealing with class nonsense
 */

module.exports = function (ast, opts, code) {
  var gen = new CodeGenerator(ast, opts, code);
  return gen.generate();
};

module.exports.CodeGenerator = CodeGenerator;
