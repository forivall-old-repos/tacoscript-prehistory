import { Token } from "horchata/lib/tokenizer";
import { types as tt } from "horchata/lib/tokenizer/types";
/**
 * Print File.program
 */

export function File(node, parent) {
  this.print(node.program, node);
}

/**
 * Print all nodes in a Program.body.
 */

export function Program(node, parent) {
  this.printSequence(node.body, node);
}

/**
 * Print BlockStatement, collapses empty blocks, prints body.
 */

export function BlockStatement(node, parent) {
  if (parent.type === 'Program') { // Probably also block; tests should reveal others
    this.push(new Token({type: tt._exec, value: 'exec'}));
  }
  if (node.body.length) {
    this.newline();
    this.printSequence(node.body, node, { indent: true });
  }
  this.finishBlock(node, parent, {indent: true});
}

/**
 * What is my purpose?
 * Why am I here?
 * Why are any of us here?
 * Does any of this really matter?
 */

export function Noop() {

}
