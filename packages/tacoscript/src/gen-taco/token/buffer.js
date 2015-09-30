import isBoolean from "lodash/lang/isBoolean";
import includes from "lodash/collection/includes";
import isNumber from "lodash/lang/isNumber";
import isArray from "lodash/lang/isArray";
import isString from "lodash/lang/isString";
import repeating from "repeating";

import getToken from "../../helpers/get-token";
import { Token } from "horchata/lib/tokenizer";
import { types as tt, TokenType } from "horchata/lib/tokenizer/types";
import { wb, sp, fsp, tab, nl } from "./types";
import { wordTokenTypes } from "./whitespace";

/**
 * Buffer for collecting generated output.
 */

export default class TokenBuffer {
  constructor(position, code) {
    this.code = code;
    this.position = position;
    this._indent = 0;
    this.tokens   = [];
    this._buf     = "";
  }

  /**
   * Get the buffer of tokens as a string.
   */

  get(opts) {
    this._serializeTokens(opts);
    return this._buf;
  }

  indent() {
    this._indent++;
  }

  dedent() {
    this._indent--;
  }

  /**
   * Indicate that this line needs to END NOW; in javascript, this would be just a semicolon.
   * Add a semicolon to the buffer.
   */

  terminateLine() {
    this.push(nl);
  }

  /**
   * Add a right brace to the buffer.
   */

  rightBrace() {
    this.push("}");
  }

  /**
   * Add a keyword to the buffer.
   */

  keyword(name) {
    this.push(name);
    this.space();
  }

  /**
   * Add a space to the buffer unless it is compact (override with force).
   */

  space(force) {
    if (force) {
      this.push(fsp);
    } else if (this.tokens.length && !this.isLastTok(sp) && !this.isLastTok(nl)) {
      this.push(sp);
    }
  }

  /**
   * Remove the last character.
   */

  removeLast(cha) {
    if (!this.isLast(cha)) return;

    this.tokens.pop();
    this.position.unshift(cha);
  }

  /**
   * Remove the last token.
   */
  removeLastTok(tokType) {
    if (!this.isLast(tokType)) return;

    let tok = this.tokens.pop();
    this.position.unshift(tok);
  }

  /**
   * Set some state that will be modified if a newline has been inserted before any
   * non-space characters.
   *
   * This is to prevent breaking semantics for terminatorless separator nodes. eg:
   *
   *    return foo;
   *
   * returns `foo`. But if we do:
   *
   *   return
   *   foo;
   *
   *  `undefined` will be returned and not `foo` due to the terminator.
   */

  startTerminatorless() {
    return this.parenPushNewlineState = {
      printed: false
    };
  }

  /**
   * Print an ending parentheses if a starting one has been printed.
   */

  endTerminatorless(state) {
    if (state.printed) {
      this.dedent();
      this.newline();
      this.push(")");
    }
  }

  /**
   * Add a newline (or many newlines), maintaining formatting.
   * Strips multiple newlines if removeLast is true.
   */

  newline(i, removeLast) {
    removeLast = removeLast || false;

    if (isNumber(i)) {
      i = Math.min(2, i);

      if (this.endsWith(["{", "\n"]) || this.endsWith([":", "\n"])) i--;
      if (i <= 0) return;

      while (i > 0) {
        this._newline(removeLast);
        i--;
      }
      return;
    }

    if (isBoolean(i)) {
      removeLast = i;
    }

    this._newline(removeLast);
  }

  /**
   * Adds a newline unless there is already two previous newlines.
   */

  _newline(removeLast) {
    // never allow more than two lines
    // if (this.endsWith("\n\n")) return;
    let tokensLen = this.tokens.length;
    if (this.tokens.length >= 2 && this.tokens[tokensLen - 2].type === nl && this.tokens[tokensLen - 1].type === nl) {
      return;
    }

    // remove the last newline
    if (removeLast && this.isLastTok(nl)) this.removeLastTok(nl);

    this.removeLastTok(sp);
    this._removeSpacesAfterLastNewline();
    this._push(nl);
  }

  /**
   * If buffer ends with a newline and some spaces after it, trim those spaces.
   */

  _removeSpacesAfterLastNewline() {
    // var lastNewlineIndex = this.buf.lastIndexOf("\n");
    // if (lastNewlineIndex === -1) {
    //   return;
    // }
    //
    // var index = this.buf.buf.length - 1;
    // while (index > lastNewlineIndex) {
    //   if (this.buf.buf[index] !== " ") {
    //     break;
    //   }
    //
    //   index--;
    // }
    //
    // if (index === lastNewlineIndex) {
    //   this.buf.buf = this.buf.buf.substring(0, index + 1);
    // }
  }

  /**
   * Push token(s) to the buffer, maintaining indentation.
   */

  push(..._tokens) {
    let tokens = _tokens;
    for (let token of (tokens: Array)) {
      this._push(token);
    }
  }

  /**
   * Push a string to the buffer.
   */

  _push(token, options = {}) {
    if (this.isLastTok(nl) && this._indent > 0) {
      this.tokens.push(new Token({ type: tab, value: this._indent }));
    }
    if (isString(token)) {
      let s = getToken(token, options);
      token = new Token(s);
      token.raw = s.raw;
    // } else if (token instanceof TokenType) {
    } else if (!token.type) { // duck type instead
      token = new Token({ type: token });
    }

    // see startTerminatorless() instance method
    // XXX FIXME
    // var parenPushNewlineState = this.parenPushNewlineState;
    // if (parenPushNewlineState && token.type === 'Whitespace') {
    //   let str = token.value;
    //   for (var i = 0; i < str.length; i++) {
    //     var cha = str[i];
    //
    //     // we can ignore spaces since they wont interupt a terminatorless separator
    //     if (cha === " ") continue;
    //
    //     this.parenPushNewlineState = null;
    //
    //     if (cha === "\n") {
    //       // we're going to break this terminator expression so we need to add a parentheses
    //       this._push("(");
    //       this.indent();
    //       parenPushNewlineState.printed = true;
    //     }
    //   }
    // }

    // TODO: position will be updated when tokens are serialized
    // this.position.push(token);
    this.tokens.push(token);
  }

  /**
   * Test if the buffer ends with a string.
   */

  endsWith(match, tokens = this.tokens) {
    if (isArray(match)) {
      if (match.length > tokens.length) { return false; }
      for (let i = 0, len = match.length, tokenOffset = tokens.length - len; i < len; i++) {
        if (!this.matches(tokens[tokenOffset + i], match[i])) { return false; }
      }
      return true;
    }
    return this.matches(tokens[tokens.length - 1], match);
  }

  /**
   * Test if a character is last in the buffer.
   */

  isLast(cha) {
    if (this.tokens.length === 0) { return false; }
    return this.matches(this.tokens[this.tokens.length - 1], cha);
  }

  /**
   * Test if a character is last in the buffer.
   */

  isLastTok(tokType) {
    if (this.tokens.length === 0) { return false; }
    return this.matchesTok(this.tokens[this.tokens.length - 1], tokType);
  }


  matches(token, cha) {
    var ctok;
    if (Array.isArray(cha)) {
      for (let ch in (cha: Array)) {
        ctok = getToken(ch);
        if (ctok.value === token.value && ctok.type === token.type) {
          return true;
        }
      }
      return false;
    } else {
      ctok = getToken(cha);
      return ctok.value === token.value && ctok.type === token.type;
    }
  }

  matchesTok(token, type) {
    if (Array.isArray(type)) {
      for (let oneType in (type: Array)) {
        if (token.type === oneType) {
          return true;
        }
      }
      return false;
    }
    return token.type === type;
  }

  // TODO: move serialization to a separate file / class
  _serializeTokens(opts) {
    let buf = "";
    let prevToken = null;
    for (let token of (this.tokens: Array)) {
      if (prevToken && includes(wordTokenTypes, prevToken.type) && includes(wordTokenTypes, token.type)) {
        buf += ' ';
      }
      if (token.start != null && token.end != null) {
        buf += (this.code.slice(token.start, token.end));
      } else if (token.type === "Whitespace") {
        buf += token.value;
        // TODO: comments
      // } else if (token.type === "CommentBlock") {
      //   // TODO: reindent comment body in block. parser should
      //   //       emit each line as a separate token, so that push will insert a tab ahead of it.
      //   // TODO: fully tokenize comments when parsing in horchata

      } else if (includes(tokenSerializationTypes.label, token.type.label)) {
        buf += (token.type.label);
      } else if (includes(tokenSerializationTypes.value, token.type.label)) {
        buf += (token.value);
      } else if (includes(tokenSerializationTypes.raw, token.type.label)) {
        buf += (token.raw);
      } else if (token.type === nl) {
        buf += "\n"; // TODO: platform specific
      } else if (token.type === tab) {
        buf += repeating(opts.indent.indent, token.value);
      } else if (token.type === sp) {
        // TODO: only insert space if not preserving space
        buf += ' ';
      } else if (token.type === fsp) {
        buf += ' ';
      } else {
        console.log(token);
      }
      prevToken = token;
    }
    this._buf = buf;
  }
}

const labelTokens = [
  'bracketL', 'bracketR', 'braceL', 'braceR', 'parenL', 'parenR',
  'comma', 'semi', 'colon', 'doubleColon', 'dot', 'question', 'arrow',
  'ellipsis', 'backQuote', 'dollarBraceL', 'at',
  'unboundArrow', 'blockCommentStart', 'lineCommentStart', 'blockCommentEnd'
];
const valueTokens = [
  'name', 'template', 'eq', 'assign', 'incDec', 'prefix',
  'logicalOR', 'logicalAND', 'bitwiseOR', 'bitwiseXOR', 'bitwiseAND',
  'equality', 'relational', 'bitShift', 'plusMin',
  'modulo', 'star', 'slash', 'exponent',
  // keywords
  '_break', '_case', '_catch', '_continue', '_debugger', '_default',
  '_do', '_else', '_finally', '_for', '_function', '_if', '_return',
  '_switch', '_throw', '_try', '_var', '_let', '_const', '_while',
  '_with', '_new', '_this', '_super', '_class', '_extends', '_export',
  '_import', '_yield', '_null', '_true', '_false', '_in', '_instanceof',
  '_typeof', '_void', '_delete',
  'commentBody'
];
const rawTokens = ['num', 'regexp', 'string'];
const specialTokens = ['eof'];

const tokenSerializationTypes = {
  label: labelTokens.map((t) => tt[t].label),
  value: valueTokens.map((t) => tt[t].label),
  raw: rawTokens.map((t) => tt[t].label),
  special: specialTokens.map((t) => tt[t].label)
};
