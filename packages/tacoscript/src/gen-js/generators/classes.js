/**
 * Print ClassDeclaration, prints decorators, typeParameters, extends, implements, and body.
 */

export function ClassDeclaration(node, parent) {
  this.printList(node.decorators, node, { separator: "" });
  this.push("class");

  if (node.id) {
    this.wordBoundary();
    this.print(node.id, node);
  }

  this.print(node.typeParameters, node);

  if (node.superClass) {
    this.catchUpToKeyword("extends");
    this.wordBoundary();
    this.push("extends");
    this.wordBoundary();
    this.print(node.superClass, node);
    this.print(node.superTypeParameters, node);
  }

  if (node.implements) {
    this.catchUpToKeyword("implements");
    this.wordBoundary();
    this.push("implements");
    this.wordBoundary();
    this.printJoin(node.implements, node, { separator: "," });
  }

  this.space();
  this.print(node.body, node);
}

/**
 * Alias ClassDeclaration printer as ClassExpression.
 */

export { ClassDeclaration as ClassExpression };

/**
 * Print ClassBody, collapses empty blocks, prints body.
 */

export function ClassBody(node, parent) {
  this.blockStart();
  if (node.body.length === 0) {
    this.blockEnd();
  } else {
    this.newline();

    this.indent();
    this.printSequence(node.body, node);
    this.dedent();

    this.blockEnd();
  }
}

/**
 * Print ClassProperty, prints decorators, static, key, typeAnnotation, and value.
 * Also: semicolons, deal with it.
 */

export function ClassProperty(node, parent) {
  this.printList(node.decorators, node, { separator: "" });

  if (node.static) { this.push("static"); this.wordBoundary(); }
  this.print(node.key, node);
  this.print(node.typeAnnotation, node);
  if (node.value) {
    this.catchUpToAssign();
    this.push("=");
    this.print(node.value, node);
  }
  this.semicolon();
}

/**
 * Print MethodDefinition, prints decorations, static, and method.
 */

export function MethodDefinition(node, parent) {
  this.printList(node.decorators, node, { separator: "" });

  if (node.static) {
    this.push("static");
    this.wordBoundary();
  }

  this._method(node);
}
