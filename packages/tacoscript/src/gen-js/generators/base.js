/**
 * Print File.program
 */

export function File(node, parent) {
  this.print(node.program, node);
  this.catchUpToEOF();
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
  this.blockStart();
  if (node.body.length) {
    // this.newline();
    this.printSequence(node.body, node, { indent: true });
    this.blockEnd();
  } else {
    this.blockEnd();
  }
}

/**
 * What is my purpose?
 * Why am I here?
 * Why are any of us here?
 * Does any of this really matter?
 */

export function Noop() {

}
